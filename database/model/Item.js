const mongoose = require('mongoose');
// const log = require('../../utils/log')
// const moment = require('moment')

const Schema = new mongoose.Schema({
  idx: Number,
  info: String,
  name: String,
  imgUrl: String,
  ival: Number,
  type: String,
  history: String,
  sum:Number,
  count:Number
})

module.exports = mongoose.model('present', Schema)
