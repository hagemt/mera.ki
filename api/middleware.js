/* eslint-env node */
const { URL } = require('url')

const Boom = require('boom')
const KoaRouter = require('koa-router')
const omnibus = require('koa-omnibus')
const parse = require('co-body')
const zxcvbn = require('zxcvbn')

const auth = require('./auth.js')
const link = require('./link.js')

class AuthRouter extends KoaRouter {

	constructor ({ data, prefix = '/auth' }) {
		super({ prefix }) // e.g. GET /login
		this.get('*', auth.useSession(data.getStorage()))
		this.post('/zxcvbn', async ({ request, response }) => {
			try {
				const { password } = await parse.json(request)
				response.body = zxcvbn(password) // 200 OK
			} catch (error) {
				omnibus.log.warn({ err: error }, 'zxcvbn failure')
				throw Boom.badRequest('A password is required.')
			}
		})
	}

}

class DataRouter extends KoaRouter {

	constructor ({ data, prefix = '/api/data' }) {
		super({ prefix }) // e.g. GET /api/data/:key => :value
		const storage = data.getStorage() // simple interface
		this.get('/:key', async ({ params, response }) => {
			const value = await storage.get(params.key)
			if (value) response.body = value // 200 OK
			else response.status = 204 // 204 No Content
		})
		// use e.g. `curl` to POST valid JSON to /api/data
		this.post('/', async ({ request, response }) => {
			const before = {} // < both are included in response:
			const after = await parse.json(request) // any JSON
			for (const [key, value] of Object.entries(after)) {
				before[key] = await storage.get(key) // may be undefined
				await storage.set(key, value) // written to disk on sync
			}
			response.body = { before, after } // 200 OK
		})
	}

}

class LinkRouter extends KoaRouter {

	constructor ({ data, prefix = '/api/link' }) {
		super({ prefix }) // e.g. HEAD /api/link/ABC123
		const links = link.fromStorage(data.getStorage())
		this.get('/:id', async ({ params, request, response }) => {
			const longURL = await links.get(params.id) // may be undefined
			if (!longURL) throw Boom.notFound(`GET ${request.path}`)
			response.body = longURL // with status: 200 OK
		})
		this.head('/:id', async ({ params, request, response }) => {
			const clicked = Number(await links.clicked(params.id, 0))
			response.set('X-Redirect-Count', clicked.toFixed())
			response.status = 200 // 200 OK (with no body)
		})
		this.post('/', async ({ omnibus, request, response }) => {
			try {
				const longURL = new URL(await parse.text(request)) // relative to request.origin:
				const shortURL = new URL(`/link?id=?${await links.shorten(longURL)}`, request.origin)
				response.set('Location', shortURL.toString()) // e.g. http://mera.ki/link?id=ABC123
				Object.assign(response, { body: response.get('Location'), status: 201 }) // Created
				omnibus.log.info({ longURL, shortURL }, 'created new URL link (will redirect)')
			} catch (error) {
				omnibus.log.warn({ err: error }, 'failed to create link (invalid URL?)')
				throw Boom.badRequest('URL invalid; please retry or contact administrator.')
			}
		})
	}

}

const createApplication = ({ log }) => omnibus.createApplication({
	targetLogger: (options, context, fields) => log.child(fields),
})

const createAuthRouter = options => new AuthRouter(options)

const createDataRouter = options => new DataRouter(options)

const createLinkRouter = options => new LinkRouter(options)

const redirectQueryID = ({ data, prefix = '/link' }) => {
	const links = link.fromStorage(data.getStorage())
	return async function redirect ({ omnibus, query, request, response }, next) {
		if (request.method !== 'GET' || request.path !== prefix) return next()
		const longURL = await links.get(query.id)
		if (longURL) {
			response.redirect(longURL) // with status: 302 Found
			omnibus.log.info({ query }, `${prefix} (was found)`)
		} else {
			omnibus.log.warn({ query }, `${prefix} (not found)`)
		}
		await next()
	}
}

module.exports = {
	createApplication,
	createAuthRouter,
	createDataRouter,
	createLinkRouter,
	redirectQueryID,
}
