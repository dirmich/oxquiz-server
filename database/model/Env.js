const mongoose = require('mongoose')
// const log = require('../../utils/log')
// const Result = mongoose.model('result')

const Schema = new mongoose.Schema(
  {
    passwd: String,
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('env', Schema)
