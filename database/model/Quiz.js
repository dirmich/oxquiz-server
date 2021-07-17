const mongoose = require('mongoose')
// const log = require('../../utils/log')
// const Result = mongoose.model('result')

const Schema = new mongoose.Schema(
  {
    class: String, // 과목
    count: Number, // 답의 갯수 2,3,4
    title: String, // 문제
    tsound: String, // 문제 음성
    quiz: String, // 퀴즈
    qtype: String, // text,sound,image
    qmedia: String, // url || text
    answers: [
      {
        type: String,
        media: String,
        ok: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('quiz', Schema)
