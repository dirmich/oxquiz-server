const config = {
  common: {
    logDir: __dirname + '/../../serverLog',
    port: 3301,
    secret_key: 'dc95e7a8310f4ec4d8e64ae8071e7ae0199cc747be3911057e',
    redis: 'localhost',
    redis_port: 6379,
    jwt: {
      skey: '!LKJLJADFJ@#KJKLF',
      expiresIn: '1y',
      issuer: 'auth.highmaru.com',
      algorithm: 'HS256',
    },
  },
  dev: {
    mongohost: 'mongodb://localhost/okquiz',
    domain: 'kakaolab.ml',
    whitelist: [
      'http://localhost:3400',
      'http://192.168.0.2:3400',
      'https://dev.kakaolab.ml',
      'https://kakaolab.ml',
    ],
  },
  prod: {
    mongohost: 'mongodb://13.125.207.151/krap',
    domain: 'kakaolab.ml',
    whitelist: ['https://dev.kakaolab.ml'],
  },
}
const env = process.env.NODE_ENV || 'dev'
console.log('[ENV]', env) //, { ...config.common, ...config[env] })
module.exports = { dev: env === 'dev', ...config.common, ...config[env] }
