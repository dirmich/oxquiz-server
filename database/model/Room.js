const mongoose = require('mongoose')
const Result = mongoose.model('result')
const redis = require('../../utils/redis')

const MAXUSER = 4

const Schema = new mongoose.Schema(
  {
    // owner: {
    //     type: Schema.Types.ObjectId, ref: 'user'
    // },
    max: {
      type: Number,
      default: MAXUSER,
    },
    roomType: String,
    isStarted: {
      type: Boolean,
      default: false,
    },
    ready: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
      },
    ],
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
      },
    ],
  },
  {
    timestamps: true,
  }
)

Schema.statics.leave = async function (sock) {
  if (!sock.uid || !sock.roomId) return
  await redis.lock()
  let room = await this.findById(sock.roomId)
  if (!room) return
  if (room.users.length == 1) {
    // await this.findByIdAndRemove(sock.roomId)
    await this.findOneAndDelete(sock.roomId)
    // sock.roomId=null
    redis.unlock()
    return null
  } else {
    let idx = room.users.indexOf(sock.uid)
    if (idx >= 0) room.users.splice(idx, 1)
    idx = room.ready.indexOf(sock.uid)
    if (idx >= 0) room.ready.splice(idx, 1)
    await room.save()
    redis.unlock()
    return room
  }
}

Schema.statics.getRoom = async function (uid, roomType) {
  await redis.lock()
  let room = await this.getRoomByUid(uid)
  if (room) {
    console.log('found')
    redis.unlock()
    return room
  } else {
    console.log('new room')
    room = await this.getAvailable(roomType)
    if (room) {
      room.users.push(uid)
      await room.save()
      redis.unlock()
      return room
    } else {
      // redis.unlock()
      // return null
      room = new this({
        roomType,
        users: [uid],
      })
      await room.save()
      redis.unlock()
      return room
    }
  }
}

Schema.statics.ready = async function (roomId, uid) {
  await redis.lock()
  let room = await this.findById(roomId)
  if (room && room.ready.indexOf(uid) < 0) {
    room.ready.push(uid)
    await room.save()
  }
  redis.unlock()
  return room
}

Schema.statics.cancel = async function (roomId, uid) {
  await redis.lock()
  let room = await this.findById(roomId)
  // let res = false
  let idx = room.ready.indexOf(uid)
  if (room && idx >= 0) {
    room.ready.splice(idx, 1)
    await room.save()
    // res = true
  }
  redis.unlock()
  // return res
  return room
}

Schema.statics.getAvailable = async function (roomType) {
  let room = await this.find({
    // $nor: [
    //     {users: { $exists: false} },
    //     {users: { $size: 4} },
    // ]
    $and: [
      {
        'users.0': {
          $exists: true,
        },
      },
      {
        'users.3': {
          $exists: false,
        },
      },
      { roomType, isStarted: false },
    ],
  })
  if (room.length >= 1) {
    console.log('available')
    return room[0]
  } else return null
}

Schema.statics.getRoomByUid = async function (uid) {
  const room = await this.find({ users: { $in: [uid] } })
  // .populate({
  //     path:'users',
  //     // model: 'user',
  //     select: {_id:1, email:1, images:1, nick:1, name:1}
  //   })
  console.log(room.length)
  if (room.length > 0) {
    return room[0]
  } else return null
}

Schema.statics.getAllRooms = async function () {
  const rooms = await this.find().select('-users -passwd')
  return rooms
}

Schema.statics.getRoomById = async function (roomId) {
  let room = await this.findById(roomId).populate({
    path: 'users',
    select: { _id: 1, uid: 1, name: 1 },
  })
  if (room) {
    room = await room.toObject()
    for (let i = 0; i < room.users.length; i++) {
      let u = room.users[i]
      // let r = await Result.getResult(u._id)
      // room.users[i].win = r.win
      // room.users[i].lose = r.lose
    }
  }
  return room
}

Schema.statics.resetReady = async function (roomId) {
  let r = await this.update({ _id: roomId }, { $set: { ready: [] } })
  let room = await this.findById(roomId)
  return room
}
Schema.methods.toJSON = function () {
  // console.log('before:',this)
  var obj = this.toObject({ versionKey: false })
  // console.log('after:',obj)
  return obj
}

const RoomModel = mongoose.model('room', Schema)

module.exports = RoomModel
