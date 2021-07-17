const config = require('../config')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
// const uuid = require('uuid/v1')

module.exports = {
  encodePassword(passwd) {
    return crypto.createHash('sha256').update(passwd).digest('hex')
  },
  signToken(raw) {
    return new Promise(function (resolve, reject) {
      jwt.sign(
        raw,
        config.jwt.JWT_KEY,
        {
          expiresIn: config.jwt.JWT_EXPIRE,
          issuer: config.jwt.JWT_ISSUER,
          algorithm: config.jwt.JWT_ALG,
        },
        function (err, token) {
          if (err) reject(err)
          else resolve(token)
        }
      )
    })
  },
  verifyToken(signed) {
    return new Promise(function (resolve, reject) {
      jwt.verify(
        signed,
        config.jwt.JWT_KEY,
        {
          issuer: config.jwt.JWT_ISSUER,
        },
        function (err, decoded) {
          if (err) reject(err)
          else resolve(decoded)
        }
      )
    })
  },
}
