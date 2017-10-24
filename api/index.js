const express = require('express')
const bodyParser = require('body-parser')

const server = express()
server.use(bodyParser())

server.post('/api/shorten', (request, response) => {
    request.pipe(response)
})

module.exports = {
    server,
}

if (!module.parent) {
    server.listen()
}