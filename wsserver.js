const SocketIO = require('socket.io')
const { createAdapter } = require('socket.io-redis')
const log = require('./utils/log')

const redis = require('./utils/redis')
const cfg = require('./config')
const jwt = require('./utils/jwt')
const mongoose = require('mongoose')
const Room = mongoose.model('room')
const User = mongoose.model('user')
class WSServer {
  constructor(server, option) {
    const defaultOpt = {
      // namespace: 'game',
      origin: 'localhost:3301',
      allowEIO3: true,
      transports: 'websocket',
    }
    const opt = { ...defaultOpt, ...option }
    this.channels = []
    const io = SocketIO(server, opt)
    this.io = io
  }

  async createChannel(channel) {
    log.debug(`create channel ${channel}`)
    const io = this.io
    // const io = this.io.of(`/${channel}`)
    // .use(async (sock, next) => {
    //   const { auth, ...opt } = sock.handshake
    //   // log.info(`create channel  ${JSON.stringify(auth)}`)
    //   try {
    //     if (auth && auth.token) {
    //       await jwt.verify(auth.token)
    //       sock.userinfo = await redis.get(auth.token)
    //       if (!sock.userinfo) throw 'no userinfo'
    //       // console.log('a->', auth, sock.userinfo)
    //       next()
    //     } else throw 'not authorized'
    //   } catch (e) {
    //     next(new Error(e))
    //   }
    // })
    this.channels[channel] = io

    io.on('connection', (sock) => {
      log.debug(
        `[${channel}] connected = require( ${sock.request.socket.remoteAddress} ${sock.id} `
      )
      this.initSocket(sock)
    })
  }

  removeChannel(channel) {
    if (this.channels[channel]) {
      delete this.channels[channel]
    }
  }

  send(s, cmd, data) {
    // console.log('send  ', cmd, data, s.id, s.roomId)
    // if (s.roomId)
    s.to(s.roomId).emit(cmd, {
      // s.emit(cmd, {
      sid: s.id,
      uid: s.user._id,
      type: s.roomType,
      ts: new Date().getTime(),
      ...data,
    })
  }
  sendto(s, peerId, cmd, data) {
    // console.log('send from ', s.id, 'to', peerId)
    if (peerId) {
      s.to(peerId).emit(cmd, {
        sid: s.id,
        uid: s.user._id,
        type: s.roomType,
        ts: new Date().getTime(),
        ...data,
      })
    } else {
      s.emit(cmd, {
        sid: s.id,
        uid: s.user._id,
        type: s.roomType,
        ts: new Date().getTime(),
        ...data,
      })
    }
  }

  initSocket(s) {
    s.on('join', async (data, cb) => {
      const { roomType, id, name } = data
      log.debug('join', data)
      try {
        let user = await User.byUid(id)
        if (!user) {
          user = new User({ uid: id, name })
          user = await user.save()
        }
        let room = await Room.getRoom(user._id, roomType)
        room = await Room.findById(room._id).populate('users')
        s.uid = user._id
        // s.user = { sid: s.id, ...user.toJSON() }
        s.user = user.toJSON()
        s.roomId = room._id.toString()
        s.join(s.roomId)
        this.send(s, 'join', { user: s.user })
        cb({ room, user })
      } catch (e) {
        console.log(e)
        cb({ err: e })
      }
    })
    s.on('leave', async (cb) => {
      log.debug('leave')
      if (s.roomId) {
        await Room.leave(s)
        this.send(s, 'leave', { user: s.user })
        s.leave(s.roomId)
        s.roomId = null
        cb({})
      }

      cb({})
    })
    s.on('result', (cb) => {
      log.debug('result', data)

      cb({})
    })
    s.on('ranklist', (cb) => {
      log.debug('ranklist', data)

      cb({})
    })
    s.on('score', ({ round, score }) => {})
    s.on('ready', async (cb) => {
      log.debug('ready')
      if (s.uid && s.roomId) {
        const room = await Room.ready(s.roomId, s.uid)
        this.send(s, 'ready', { ready: room.ready, user: s.user })
        cb({ ready: room.ready, length: room.ready.length })
      } else cb({ err: 'login and join' })
    })
    s.on('start', (cb) => {
      log.debug('start')
      this.send(s, 'start', { round: 0 })
      cb({})
    })
    s.on('cancel', async (cb) => {
      log.debug('cancel')
      if (s.uid && s.roomId) {
        const room = await Room.cancel(s.roomId, s.uid)
        this.send(s, 'cancel', { ready: room.ready, user: s.user })
        cb({ ready: room.ready, length: room.ready.length })
      } else cb({ err: 'login and join' })
    })
    s.on('sendTo', (data, cb) => {
      const { tid, ...param } = data
      log.debug('sendTo', data)
      this.sendto(s, tid, 'sendTo', param)
      cb({})
    })
    s.on('broadcast', (data, cb) => {
      log.debug('broadcast', data)
      this.send(s, 'broadcast', data)
      cb({})
    })
    s.on('disconnect', async (e) => {
      log.debug('disconnect', e)
      if (s.roomId) {
        await Room.leave(s)
        this.send(s, 'leave', { user: s.user })
        s.leave(s.roomId)
        s.roomId = null
      }
    })
  }
}

module.exports = WSServer
