const { gen } = require('./namegen')
const db = require('./database')
const mongoose = require('mongoose')
const GameData = mongoose.model('gamedata')
const Present = mongoose.model('present')
const Env = mongoose.model('env')
const moment = require('moment')

const member = gen(100)
let now = moment()


Array.prototype.choice = function(p=.5) {
  if (p==0) return null
  let ts = Math.round(this.length / p)
  let idx = Math.floor(Math.random()*ts)
  return (idx<this.length)?this[idx]:null
}

Present.find().then((pr)=>{
  for (let i=0;i<10;i++) {
    console.log(now)
    now = now.subtract(1,'days')
    member.forEach(async (m)=>{
      pp = pr.choice(.4)
      let opt = {
        uid: m.email,
        name: m.name,
        phone: m.phone,
        address: m.addr,
        date: now,
        type: (pp)?pp.type:'-',
        rcode: (pp)?pp.idx:0,
        rname: (pp)?(pp.name+((pp.type=='p')?'포인트':'')):'꽝'
      }
      let result = new GameData(opt)
      await result.save()
    })
  }
})

// console.log(gen(100))