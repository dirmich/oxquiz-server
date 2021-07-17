const jwt = require('jsonwebtoken')
const cfg = require('../config')

class Jwt {
  constructor({ skey, pkey, ...opt }) {
    if (Jwt.instance) {
      console.log('old :>> ')

      return Jwt.instance
    }
    console.log('new :>> ')
    Jwt.instance = this
    this.skey = skey
    this.pkey = pkey ? pkey : skey
    this.opt = {
      expiresIn: '365d', // 60000, //60, "2 days", "10h", "7d"
      algorithm: 'HS256',
      noTimestamp: true,
      issuer: 'auth.highmaru.com',
      ...opt,
    }
    this.verifier = { issuer: this.opt.issuer }
  }

  sign(obj) {
    return new Promise((resolve, reject) => {
      jwt.sign(
        obj,
        this.skey,
        { ...this.opt, ...this.verifier },
        (err, token) => {
          if (err) reject(err)
          else resolve(token)
        }
      )
    })
  }

  verify(token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, this.pkey, this.verifier, (err, decoded) => {
        if (err) reject(err)
        else resolve(decoded)
      })
    })
  }
  decode(token) {
    return new Promise((resolve, reject) => {
      try {
        const decode = jwt.decode(token, { complete: true })
        resolve(decode)
      } catch (e) {
        reject(e)
      }
    })
  }
}

// const instance = new Jwt(cfg.jwt)
// Object.freeze(instance)
// module.exports = instance
module.exports = new Jwt(cfg.jwt)
