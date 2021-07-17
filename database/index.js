const config = require('../config')
const mongoose = require('mongoose')
//// for debugging
const ctx = require('require-context')
const models = ctx(__dirname + '/model', true, /\.js/, 'lazy')
models.keys().forEach((f) => {
  models(f)
})

const initDB = require('./initDB')
const log = require('../utils/log')
const dbSingleton = (function () {
  const db = mongoose.connection
  let instance = null
  async function init() {
    mongoose.Promise = Promise
    db.on('error', log.error)
    db.on('connected', () => {
      log.info('MONGO] connected')
    })
    db.on('reconnected', () => {
      log.info('MONGO] reconnected')
    })
    db.on('disconnected', () => {
      log.error('MONGO] disconnected')
    })
    db.on('close', () => {
      log.info('MONGO] closed')
    })
    db.once('open', function () {
      log.info('Connected to mongod server')
    })
    const url = config.mongohost
    const conn = await mongoose.connect(url, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    })
    log.debug(`url (${url}) connected`)
    await initDB()
    return {
      conn: conn,
    }
  }
  return {
    createDatabase: function () {
      if (!instance) {
        init().then((r) => {
          instance = r
          return r
        })
      }
      return instance
    },
  }
})()

// log.debug(dbSingleton)

// module.exports = dbSingleton
module.exports = dbSingleton.createDatabase()
