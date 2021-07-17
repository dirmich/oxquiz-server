const mongoose = require('mongoose')
// const log = require('../../utils/log')
// const Result = mongoose.model('result')

const Schema = new mongoose.Schema(
  {
    uid: String,
    name: String,
    character: String,
    spoint: Number, // 수업포인트
    gpoint: Number, // 게임포인트
  },
  {
    timestamps: true,
  }
)

Schema.statics.byUid = async function (uid) {
  return this.findOne({ uid })
}

module.exports = mongoose.model('user', Schema)
