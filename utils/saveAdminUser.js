const CryptoJs = require('crypto-js')
const { User } = require('../db/connect')

module.exports = async function () {
  const user = await User.findOne({account: 'admin@qq.com'})
  if (!user) {
    await User.create({
      account: 'admin@qq.com',
      password: CryptoJs.MD5('123456').toString(),
      username: 'Admin',
      role: '总领导',
      entryTime: Date.now()
    })
  }
}