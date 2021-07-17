const cfg = require('./config')
const express = require('express')
const http = require('http')
const bodyParser = require('body-parser')
const cors = require('cors')
const db = require('./database')
const routes = require('./routes')
const app = express()
const morgan = require('morgan')
const log = require('./utils/log')
const WSServer = require('./wsserver')
require('./utils/util')
let port = cfg.port

const server = http.createServer(app)

const whitelist = cfg.whitelist
const corsOptions = {
  origin: (o, cb) => {
    if (whitelist.indexOf(o) !== -1 || !o) {
      console.log('=>', o)
      cb(null, true)
    } else {
      console.log('F=>', whitelist, o)
      cb(new Error('Not allowed'))
    }
  },
  credentials: true,
  // optionsSuccessStatus: 200,
}

const wsserver = new WSServer(server, { cors: corsOptions })
wsserver.createChannel('game')
app.use(cors(corsOptions))
app.use(morgan('combined', { stream: log.stream }))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
// app.use('/uploads',express.static(path.join(__dirname, '../uploads')));

// app.use(express.static(__dirname + '/public'))

// app.engine('html', require('ejs').renderFile)
// app.set('view engine', 'ejs')

app.use(require('./middleware/response'))

app.use('/api', routes)
app.use('/', (req, res, next) => {
  res.send('hello')
})

app.use(function (req, res, next) {
  const err = new Error('Not Found')
  err.status = 401
  next(err)
})

// catch 404 and forward to error handler

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.json({ err })
  // res.render('error')
})

server.listen(port, () => {
  log.info(`Listen port ${port}`)
})
server.on('error', onError)

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error
  }

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges')
      process.exit(1)
    case 'EADDRINUSE':
      console.error(bind + ' is already in use')
      process.exit(1)
    default:
      throw error
  }
}
