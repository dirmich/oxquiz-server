// 'use strict'
const { createLogger, format, transports } = require('winston')
require('winston-daily-rotate-file')
const fs = require('fs')
const path = require('path')
const cfg = require('../config')
const env = process.env.NODE_ENV || 'development'
const logDir = cfg.logDir
const loglevel = env === 'development' ? 'debug' : 'info'
var PROJECT_ROOT = path.join(__dirname, '..')
// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir)
}

const dailyRotateFileTransport = new transports.DailyRotateFile({
  level: 'debug',
  filename: `${logDir}/%DATE%.log`,
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
})

const dailyRotateErrorFileTransport = new transports.DailyRotateFile({
  level: 'warn',
  filename: `${logDir}/%DATE%.error.log`,
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
})

const logger = createLogger({
  level: 'warn',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss.SSS',
    }),
    // format.prettyPrint(),
    format.printf((info) => {
      const rest = JSON.stringify(
        Object.assign({}, info, {
          level: undefined,
          message: undefined,
          splat: undefined,
          timestamp: undefined,
        })
      )
      info.message = `${info.message} ${rest !== '{}' ? rest : ''}`
    }),
    format.json()
  ),
  transports: [
    new transports.Console({
      level: loglevel,
      format: format.combine(
        // label({ label: __filename}),
        format.colorize(),
        format.printf(({ level, message, timestamp }) => {
          return `[${timestamp}] ${level}: ${message}`
        })
      ),
    }),
    dailyRotateFileTransport,
    dailyRotateErrorFileTransport,
  ],
})

/**
 * Attempts to add file and line number info to the given log arguments.
 */
function formatLogArguments(args) {
  args = Array.prototype.slice.call(args)

  var stackInfo = getStackInfo(1)

  if (stackInfo) {
    // get file path relative to project root
    var calleeStr = '(' + stackInfo.relativePath + ':' + stackInfo.line + ')'

    // args = args.map((i) => (typeof i === 'object' ? JSON.stringify(i) : i))
    if (typeof args[0] === 'string') {
      args[0] = calleeStr + ' ' + args[0]
    } else {
      args.unshift(calleeStr)
    }
  }

  return args
}

/**
 * Parses and returns info about the call stack at the given index.
 */
function getStackInfo(stackIndex) {
  // get call stack, and analyze it
  // get all file, method, and line numbers
  var stacklist = new Error().stack.split('\n').slice(3)

  // stack trace format:
  // http://code.google.com/p/v8/wiki/JavaScriptStackTraceApi
  // do not remove the regex expresses to outside of this method (due to a BUG in node.js)
  var stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/gi
  var stackReg2 = /at\s+()(.*):(\d*):(\d*)/gi

  var s = stacklist[stackIndex] || stacklist[0]
  var sp = stackReg.exec(s) || stackReg2.exec(s)

  if (sp && sp.length === 5) {
    return {
      method: sp[1],
      relativePath: path.relative(PROJECT_ROOT, sp[2]),
      line: sp[3],
      pos: sp[4],
      file: path.basename(sp[2]),
      stack: stacklist.join('\n'),
    }
  }
}

logger.stream = {
  write: (info) => logger.info(info),
}

// module.exports = logger

// A custom logger interface that wraps winston, making it easy to instrument
// code and still possible to replace winston in the future.

module.exports.debug = module.exports.log = function () {
  logger.debug.apply(logger, formatLogArguments(arguments))
}

module.exports.info = function () {
  logger.info.apply(logger, formatLogArguments(arguments))
}

module.exports.warn = function () {
  logger.warn.apply(logger, formatLogArguments(arguments))
}

module.exports.error = function () {
  logger.error.apply(logger, formatLogArguments(arguments))
}

module.exports.stream = logger.stream

// const methods = ['debug', 'log', 'warn', 'error']
// methods.forEach((methodName) => {
//   const originalLoggingMethod = console[methodName]
//   console[methodName] = (firstArgument, ...otherArguments) => {
//     const originalPrepareStackTrace = Error.prepareStackTrace
//     Error.prepareStackTrace = (_, stack) => stack
//     const callee = new Error().stack[1]
//     Error.prepareStackTrace = originalPrepareStackTrace
//     const relativeFileName = path.relative(process.cwd(), callee.getFileName())
//     const prefix = `[${moment().format(
//       'YYYY-MM-DD hh:MM:ss.SSS'
//     )}:${relativeFileName}:${callee.getLineNumber()}]:`
//     if (typeof firstArgument === 'string') {
//       originalLoggingMethod(prefix + ' ' + firstArgument, ...otherArguments)
//     } else {
//       originalLoggingMethod(prefix, firstArgument, ...otherArguments)
//     }
//   }
// })

// const log1 = console.log
// function proxiedLog(...args) {
//   const line = ((new Error('log').stack.split('\n')[2] || '…').match(
//     /\(([^)]+)\)/
//   ) || [, 'not found'])[1]
//   log1.call(console, `${line}\n`, ...args)
// }
// console.info = proxiedLog
// console.log = proxiedLog
