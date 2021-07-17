const opts = {
  ok: function (obj) {
    // log.debug('response==>', obj ? obj : {})
    this.json(obj ? obj : {})
  },
  fail: function (msg) {
    this.json({
      err: true,
      msg,
    })
  },
  authFail: function () {
    this.status(401).send()
    // this.status(401).json({
    //   err: true,
    //   msg: 'authorize failed',
    // })
  },
  badParams: function () {
    this.status(403)
    // this.status(403).json({
    //   err: true,
    //   msg: 'bad parameter',
    // })
  },
}

var response = function (req, res, next) {
  Object.assign(res, opts)
  next()
}

module.exports = response
