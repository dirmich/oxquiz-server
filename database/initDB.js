const mongoose = require('mongoose')
const Env = mongoose.model('env')
const { encodePassword } = require('../utils/crypto')
const log = require('../utils/log')

function init() {
  mongoose.connection.db
    .listCollections({
      name: 'envs',
    })
    .next(async (err, info) => {
      const users = await Env.find({})

      if (info === null || users.length === 0) {
        let env = new Env({
          passwd: encodePassword('123456'),
        })
        // await env.save()
        env
          .save()
          .then(() => {
            log.debug('init admin password')
          })
          .catch((e) => {
            log.error('init failed: ', e)
          })
      } else {
        log.debug('already has admin data')
      }
    })
}

module.exports = init
