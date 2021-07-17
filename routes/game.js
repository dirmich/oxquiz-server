var express = require('express')
var router = express.Router()
const mongoose = require('mongoose')
const GameData = mongoose.model('gamedata')
const Present = mongoose.model('present')
const Env = mongoose.model('env')
const log = require('../utils/log')
const moment = require('moment')

const rq = require('request-promise')

async function addpoint(userid, point) {
  let res = await rq({
    method: 'POST',
    uri: 'https://minigold.co.kr/game_api/insert.php',
    headers: {
      apiKey: 'yJK2zhH3CvPOvgrmYm0pFD3ovO1mEn02DDxFwFESJEVXSuMHIJ',
      userid: userid,
      point: point,
    },
  })
  const ok = '"result":"OK"'

  log.info(res + ' userid:' + userid + ', point:' + point)
  try {
    return res.includes(ok) ? 'OK' : 'NOK'
    // res = JSON.parse(res)
    // //log.info(res.result)
    // return res.result
  } catch (e) {
    //	log.error(e)
    //	log.info(e)
    console.error(e)
    return 'NOK'
  }
}

Array.prototype.choice = function (p = 0.5) {
  if (p == 0) return null
  let ts = Math.round(this.length / p)
  let idx = Math.floor(Math.random() * ts)
  return idx < this.length ? this[idx] : null
}

router.get('/getlist', async (req, res, next) => {
  let ret = await Present.find({}, { _id: 0, __v: 0, ival: 0 })

  res.json({ presents: ret }) //, list:ret.docs, count: ret.docs.length })
  // }
  // catch(e) {
  //   res.json({ error: e})
  // }
})

router.post('/play2', async (req, res, next) => {
  let data = req.body
  res.json({ err: 'Invalid parameters' })
  // console.log(data)
})

router.post('/play', async (req, res, next) => {
  let data = req.body
  log.info(JSON.stringify(data))
  if (!data || !data.id || !data.name) {
    res.json({ err: 'Invalid parameters' })
    return
  }
  // var now = new Date();
  // var startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // console.log(moment().startOf('day'),startOfToday)

  // let startOfToday = now.startOf('day')

  let fopt = {
    uid: data.id,
    name: data.name,
    date: {
      $gte: moment().startOf('day').format(),
    },
  }
  let ret = await GameData.findOne(fopt)
  if (ret) {
    log.info('already chosen : ' + data.id + ' ' + data.name)
    res.json({ play_ok: false, result: 'OK' })
    return
  }
  let pr = await Present.find({
    ival: {
      $gt: 0,
    },
  })
  ret = await Env.findOne()
  let p = ret.xpercent / 100

  let pp = pr.choice(p)

  // return res.json({
  //   p:p,
  //   pp:pp,
  //   pr:pr
  // })
  if (pp) {
    // if (pp.ival>0)  {
    // let r = Present.findByIdAndUpdate(mongoose.Types.ObjectId(pp._id),{
    await Present.findOneAndUpdate(
      { idx: pp.idx },
      {
        $inc: {
          ival: -1,
        },
      }
    )
    // console.log('Decrease ival for ',pp.idx,pp)
    // }
    // else pp = null
  }
  let opt = {
    uid: data.id,
    name: data.name,
    phone: data.phone,
    address: data.address,
    date: moment().format(),
    type: pp ? pp.type : '-',
    rcode: pp ? pp.idx : 0,
    rname: pp ? pp.name + (pp.type == 'p' ? '포인트' : '') : '꽝',
    ready: false,
    pp: pp ? pp.name : 0,
  }

  //  res.json({ play_ok:true, pid:opt.rcode, pname:opt.rname, result:result})//, list:ret.docs, count: ret.docs.length })
  //return;
  let result = 'OK'
  if (pp && pp.type == 'p') {
    //  result = await addpoint(data.id,pp.name)
    // // result = "OK"
    // if (result!="OK")
    //   result = "NOK"
    opt.pp = pp.name
    opt.ready = true
  } else {
    opt.pp = 0
  }
  log.info('id:' + data.id + ', pp:' + opt.rname + ' >> ' + result)
  // if (result=='OK') {
  let r = new GameData(opt)
  await r.save()
  // }
  // res.json({ play_ok:(result=='OK'), pid:opt.rcode, pname:opt.rname, result:result})//, list:ret.docs, count: ret.docs.length })
  res.json({ play_ok: true, pid: opt.rcode, pname: opt.rname, result: result }) //, list:ret.docs, count: ret.docs.length })
})

module.exports = router
