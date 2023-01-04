#!/usr/bin/env node
let app = require('../app')
let debug = require('debug')('http')
let http = require('http')
let port = normalizePort(process.env.PORT || '4001')

function getIPAddress() {
  var interfaces = require('os').networkInterfaces()
  for (var devName in interfaces) {
    var iface = interfaces[devName]

    for (var i = 0; i < iface.length; i++) {
      var alias = iface[i]
      if (
        alias.family === 'IPv4' &&
        alias.address !== '127.0.0.1' &&
        !alias.internal
      )
        return alias.address
    }
  }
  return '0.0.0.0'
}

app.set('port', port)
let server = http.createServer(app)
server.listen(port)
server.on('error', onError)
server.on('listening', onListening)
function normalizePort(val: string) {
  let port = parseInt(val, 10)
  if (isNaN(port)) {
    return val
  }
  if (port >= 0) {
    return port
  }
  return false
}
function onError(error: any) {
  if (error.syscall !== 'listen') {
    throw error
  }
  let bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges')
      process.exit(1)
      break
    case 'EADDRINUSE':
      console.error(bind + ' is already in use')
      process.exit(1)
      break
    default:
      throw error
  }
}
function onListening() {
  let addr = server.address()
  let bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port
  console.log('Running at ...')
  console.log('http://' + getIPAddress() + ':' + addr.port)
  console.log('http://localhost:' + addr.port)

  debug('Listening on ' + bind)
}
