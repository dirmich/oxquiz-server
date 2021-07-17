/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Array 관련 함수 확장
// =========================================================================================================================
if (!Array.prototype.remove) {
  Array.prototype.remove = function (idx, length = 1) {
    let ret = null
    if (typeof idx === 'function') {
      const i = this.findIndex(idx)
      if (i >= 0) {
        ret = this.splice(i, length)
      }
    } else {
      ret = this.splice(idx, length)
    }
    return ret && ret.length === 1 ? ret[0] : ret
  }
}
if (!Array.prototype.getAt) {
  Array.prototype.getAt = function (idx) {
    let ret = null
    if (typeof idx === 'function') {
      const i = this.findIndex(idx)
      if (i >= 0) {
        ret = this[i]
      }
    } else {
      ret = this[idx]
    }
    return ret
  }
}
String.prototype.supplant = function (o) {
  return this.replace(/{([^{}]*)}/g, function (a, b) {
    var r = o[b]
    return typeof r === 'string' || typeof r === 'number' ? r : a
  })
}

function isNull(a) {
  return typeof a === undefined || (typeof a !== 'number' && !a)
}

function checkNull(a, v) {
  return isNull(a) ? v : a
}

function isEmpty(obj) {
  return Object.keys(obj).length === 0
}

function setDefault(req, defaultOpt) {
  const ret = {}
  for (k in defaultOpt) {
    ret[k] = isNull(req[k]) ? defaultOpt[k] : req[k]
  }
  return ret
}

function checkValid(req, defaultOpt) {
  for (k in defaultOpt) {
    if (isNull(req[k])) return false
  }
  return true
}

function checkHangulEnd(str) {
  if (typeof str !== 'string') return false

  var lastLetter = str[str.length - 1]
  var uni = lastLetter.charCodeAt(0)

  if (uni < 44032 || uni > 55203) return false

  return (uni - 44032) % 28 != 0
}

function diff(org, val) {
  const ret = {}
  for (k in val) {
    if (typeof val[k] === 'object') {
      if (org[k] !== undefined) ret[k] = diff(org[k], val[k])
      else ret[k] = val[k]
    } else if (val[k] !== org[k]) ret[k] = val[k]
  }
  return ret
}
function checkChanged(old, val) {
  return old === val ? undefined : val
}

function getTime(time) {
  const buf = time.split(':')
  return parseInt(buf[0]) * 60 + parseInt(buf[1])
}

module.exports = {
  isNull,
  setDefault,
  checkValid,
  checkNull,
  checkHangulEnd,
  isEmpty,
  checkChanged,
  diff,
  getTime,
}
