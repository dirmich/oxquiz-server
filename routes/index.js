var router = require('express').Router()
var game = require('./game')
var admin = require('./admin')
var image = require('./image')

var Env = require('mongoose').model('env')
const jwt = require('../utils/jwt')
const crypto = require('../utils/crypto')

function checkAuth(req, res, next) {
  let token
  if (!req.headers.authorization) {
    console.log('no auth header')
    res.status(401).json({
      err: 'authorize failed',
    })
  } else {
    auth = req.headers.authorization.split(' ')
    token = auth[1]
    // console.log('token', token)
    jwt
      .verify(token)
      .then(async (u) => {
        // console.log('decrypted:',u)
        // const user = await User.findById(u.id,{password:0})
        // req.user = user
        next()
      })
      .catch((e) => {
        // console.log('verify',e)
        res.status(401).json({
          err: 'authorize failed',
        })
      })
  }
}

router.post('/setpwd', checkAuth, async (req, res, next) => {
  try {
    if (!req.body.pwd) {
      throw '프로토콜에러'
    } else {
      let pwd = req.body.pwd
      let env = await Env.findOne()
      env.passwd = crypto.encodePassword(pwd)
      await env.save()
      let token = await jwt.sign({ seed: 'slotgame' })
      res.json({
        token: token,
      })
    }
  } catch (e) {
    res.json({
      error: e,
    })
  }
})

router.post('/percent', checkAuth, async (req, res, next) => {
  try {
    if (!req.body.p) {
      throw '프로토콜에러'
    } else {
      let p = req.body.p
      let env = await Env.findOne()
      env.xpercent = p
      await env.save()
      res.json({
        error: '',
      })
    }
  } catch (e) {
    res.json({
      error: e,
    })
  }
})
router.post('/login', async (req, res, next) => {
  try {
    if (!req.body.pwd) {
      throw '프로토콜에러'
    } else {
      const { pwd } = req.body
      const env = await Env.findOne()
      if (env.passwd === crypto.encodePassword(pwd)) {
        const token = await jwt.sign({ seed: 'quizgame' })
        res.json({
          token: token,
        })
      } else {
        throw '인증실패'
      }
    }
  } catch (e) {
    res.json({
      error: e,
    })
  }
})
router.use('/game', game)
router.use('/admin', checkAuth, admin)
router.use('/image', image)

module.exports = router
