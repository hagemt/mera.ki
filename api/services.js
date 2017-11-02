/* eslint-env node */
const HTTP = require('http')

//const koaBodyParser = require('koa-bodyparser')
//const koaCompose = require('koa-compose')
//const koaCompress = require('koa-compress')
//const koaCORS = require('@koa/cors')
//const koaEtag = require('koa-etag')
//const koaFavicon = require('koa-favicon')
//const koaHelmet = require('koa-helmet')
//const koaPassport = require('koa-passport')
//const koaSession = require('koa-session')
const koaStatic = require('koa-static')
const httpShutdown = require('http-shutdown')
const _ = require('lodash')

const config = require('./config.js')
const data = require('./data.js')
const middleware = require('./middleware.js')

/*
const koaPassportSetup = () => {
	const one = koaPassport.initialize()
	const two = koaPassport.session()
	return koaCompose([one, two])
}
*/

const koaBoilerplate = ({ application, data, log }) => {
	application.keys = [process.env.SECRET || 'mera.ki']
	application.proxy = true // what does this do exactly?
	//application.use(koaBodyParser())
	//application.use(koaCompress())
	//application.use(koaCORS())
	//application.use(koaEtag())
	//application.use(koaFavicon())
	//application.use(koaHelmet())
	//application.use(koaPassportSetup({ data, log }))
	//application.use(koaSession({}, application))
	return async function probe (context, next) {
		await next()
	}
}

const createService = _.once(() => {
	const log = data.getLogger().child({ component: 'service' })
	const application = middleware.createApplication({ log })
	const SERVED_FOLDER = config.get('server.path') // ../served
	application.use(koaStatic(SERVED_FOLDER, { defer: true }))
	application.use(koaBoilerplate({ application, data, log }))
	const routers = [] // routers handle distinct resources:
	routers.push(middleware.createAuthRouter({ data }))
	routers.push(middleware.createDataRouter({ data }))
	routers.push(middleware.createLinkRouter({ data }))
	for (const router of routers) {
		application.use(router.routes())
		application.use(router.allowedMethods())
	}
	application.use(middleware.redirectLinks({ data }))
	// a "service" is (for now) just an Object w/ logger + server
	const server = HTTP.createServer(application.callback())
	return Object.freeze({ log, server: httpShutdown(server) })
})

const startService = ({ log, server }, { port }) => {
	return new Promise((resolve, reject) => {
		server.on('error', (error) => {
			if (!server.listening) reject(error)
			else log.warn(error, 'internal failure')
		})
		server.once('listening', () => {
			log.info({ port }, 'listening')
			resolve(server)
		})
		server.listen(port)
	})
}

const stopService = ({ server }, { timeout }) => {
	return new Promise((resolve, reject) => {
		server.shutdown(resolve) // as graceful as possible
		const message = `failed to stop within ${timeout}ms`
		setTimeout(reject, timeout, new Error(message))
	})
}

module.exports = {
	createService,
	startService,
	stopService,
}
