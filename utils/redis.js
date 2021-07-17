const redis = require('redis')
const cfg = require('../config')

function sleep(mili) {
  return new Promise((resolve, reject) => {
    console.log('sleep')
    setTimeout(resolve, mili)
  })
}
class Redis {
  constructor(host = 'localhost', port = 6379) {
    if (Redis.instance) return Redis.instance
    Redis.instance = this
    this.host = host
    this.port = port
    this.client = redis.createClient(port, host)
  }

  getClient(duplicate = false) {
    return duplicate
      ? this.client.duplicate()
      : redis.createClient(this.port, this.host)
  }

  set(key, val) {
    return new Promise((resolve, reject) => {
      this.client.set(
        key,
        typeof val === 'object' ? JSON.stringify(val) : val,
        (e) => {
          if (e) reject(e)
          resolve()
        }
      )
    })
  }

  get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (e, d) => {
        if (e) reject(e)
        try {
          resolve(JSON.parse(d))
        } catch (e) {
          resolve(d)
        }
      })
    })
  }

  remove(key) {
    return new Promise((resolve, reject) => {
      this.client.del(key, (e, n) => {
        if (e) reject(e)
        resolve(n)
      })
    })
  }

  async getset(key, val) {
    return new Promise((resolve, reject) => {
      const r = this.client.getset(key, val, (e, s) => {
        if (e) reject(e)
        else resolve(s)
      })
      if (!r) reject('err')
    })
  }
  async lock() {
    let r = await this.getset('lock', '1')
    let retry = 10
    while (retry > 0 && r > 0) {
      await sleep(500)
      retry--
      r = await this.getset('lock', '1')
    }
    return r == 0
  }

  async unlock() {
    const r = await this.getset('lock', 0)
  }

  loadAll(withValue = false) {
    return new Promise((resolve, reject) => {
      this.client.keys('*', (err, keys) => {
        if (err) reject(err)

        resolve(
          withValue
            ? Promise.all(
                keys.map(async (k) => {
                  return { [k]: await this.get(k) }
                })
              )
            : keys
        )
      })
    })
  }
}

// const instance = new Redis(cfg.redis, cfg.redis_port)
// Object.freeze(instance)
module.exports = new Redis(cfg.redis, cfg.redis_port)
