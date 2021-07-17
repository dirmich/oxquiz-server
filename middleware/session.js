const redis = require('../utils/redis')
// const { verifyToken } = require('./crypto')
const jwt = require('../utils/jwt')
const log = require('../utils/log')
function checkAuth(checkAdmin = false) {
  return async (req, res, next) => {
    let token
    // log.debug('[checkAuth]')
    if (!req.headers.authorization) {
      res.authFail()
    } else {
      const auth = req.headers.authorization.split(' ')
      try {
        if (auth.length != 2) {
          throw 'invalid header'
        }
        token = auth[1]
        // log.debug('token', req.headers)
        // token = req.headers.authorization
        // console.log('token', token, auth, req.headers.authorization)
        await jwt.verify(token)
        // log.debug('a->', a)
        req.userinfo = await redis.get(token)
        if (!req.userinfo) throw 'no userinfo'
        req.token = token
        // console.log(req.userinfo, req.token)
        if (checkAdmin) {
          if (req.userinfo.type !== 'A' && req.userinfo.type !== 'S')
            throw 'not admin'
        }
        next()
      } catch (e) {
        log.error(`verify: ${e}`)
        await redis.remove(token)
        res.authFail()
      }
    }
  }
}

module.exports = {
  checkAuth,
}
