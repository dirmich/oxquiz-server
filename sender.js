const log = require('./utils/log')
const db = require('./database')
const moment = require('moment')
const mongoose = require('mongoose')
const GameData = mongoose.model('gamedata')

const rq = require('request-promise')

async function addpoint(userid,point) {
  let res = await rq({
    method:'POST',
    uri: 'https://minigold.co.kr/game_api/insert.php',
    headers: {
      apiKey: 'yJK2zhH3CvPOvgrmYm0pFD3ovO1mEn02DDxFwFESJEVXSuMHIJ',
      userid: userid,
      point: point
    }
  })
  const ok = '"result":"OK"'
  let ret = (res.includes(ok)) ? "OK" : "NOK"
console.log('res-->',res)
  log.info('res:'+res+' userid:'+userid+', point:'+point+' : send '+ret)
//  return ret=='OK'
	return ret
}

async function check() {
  try {
    let res = await GameData.find({ready:true})
    if (res.length>0) log.info('check '+res.length)
    // console.log(res)
    for (let i=0;i<res.length;i++) {
      let item=res[i]
      let ret = await addpoint(item.uid,item.pp)
      console.log(ret)
//      item.ready = (ret!='OK')
      item.ready = false
      await item.save()
      // log.info('save ok')
    }
  }
  catch(e) {
    log.err(e)
    // console.error(e)
  }
  return setTimeout(await check,5000)
}

(async()=>{
  setTimeout(await check,5000)
})()
