var express = require('express')
var router = express.Router()
const mongoose = require('mongoose')
const GameData = mongoose.model('gamedata')
const Present = mongoose.model('present')
const Env = mongoose.model('env')
const PAGESIZE = 10

router.get('/presents', async (req, res) => {
  let ret = await Present.find()
  for (let i = 0; i < ret.length; i++) {
    let name = ret[i].name
    if (ret[i].type == 'p') name += '포인트'
    ret[i].count = await GameData.count(name)
  }
  let p = await Env.findOne()
  // console.log(ret)
  res.json({
    list: ret,
    p: p.xpercent,
  })
})

router.post('/presents', async (req, res) => {
  let data = req.body
  if (!data || !data.idx || !data.ival || !data.type || !data.name) {
    res.json({
      err: -1,
      errmsg: 'Invalid parameters',
    })
    return
  }
  let item = new Present({
    idx: data.id,
    info: data.info,
    ival: data.ival,
    type: data.type,
  })
  await item.save()
  return res.json({
    err: 0,
  })
})

router.get('/getlist', async (req, res, next) => {
  let opt = {}
  let s = req.query.sd.split('-')
  let d = req.query.ed.split('-')
  // try {
  if (req.query.sd) {
    opt['date'] = {
      $gte: new Date(s[0], s[1] - 1, s[2]),
      $lte: new Date(d[0], d[1] - 1, d[2], '23', '59', '59'),
    }
  }
  if (req.query.mode == 1) opt['type'] = 'g'
  if (req.query.mode == 2) opt['type'] = 'p'
  if (req.query.userid) {
    opt['uid'] = req.query.userid
  }
  let pagenum = req.query.page ? Number(req.query.page) : 1
  let pagesize = req.query.pagesize ? Number(req.query.pagesize) : PAGESIZE
  // if (pagenum<1) pagenum=1

  // let pcount = await GameData.count()
  let pcount = await GameData.countDocuments()
  let ucount = await GameData.distinct('uid', {
    date: opt['date'],
  })
  // console.log(opt,req.query)
  let ret
  if (pagenum > 0) {
    ret = await GameData.paginate(opt, {
      page: pagenum,
      limit: pagesize,
      sort: { date: -1 },
    })
  } else {
    ret = await GameData.find(opt)
    ret = {
      docs: ret,
    }
  }
  res.json({ meta: ret, playcount: pcount, ucount: ucount.length }) //, list:ret.docs, count: ret.docs.length })
})

module.exports = router
