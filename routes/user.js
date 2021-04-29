const express = require('express')
const router = express.Router()
const { User, UserRoleChange } = require('../db/connect')
const dayjs = require('dayjs')
const { ROLE_LIST } = require('../constants/constants')

router.get('/userInfo', async(req, res) => {
  const account = req.query.account
  const user = await User.findOne({account})
  const data = {
    account: user.account,
    role: user.role,
    username: user.username,
    avatar: user.avatar,
    entryTime: dayjs(user.entryTime).format(('YYYY年MM月DD日'))
  }
  res.send(JSON.stringify({
    code: 0,
    msg: null,
    data
  }))
})

router.put('/userInfo', async(req, res) => {
  const obj = req.body
  const user = await User.findOne({account: obj.account})
  await User.updateOne({account: obj.account}, {
    avatar: obj.avatar,
    username: obj.username,
    role: obj.role
  })
  if (user.role !== obj.role) {
    await UserRoleChange.create({
      operatorAccount: obj.operatorAccount,
      operatedAccount: obj.account,
      time: Date.now(),
      roleBefore: user.role,
      roleAfter: obj.role
    })
  }
  res.send(JSON.stringify({
    code: 0,
    msg: '更新成功'
  }))
})

router.get('/userGroups', async(req, res) => {
  const data = await User.aggregate([
    {
      $group: {
        _id: '$role',
        users:{"$push":"$$ROOT"}
      }
    }
  ])
  data.sort((a, b) => {
    return ROLE_LIST[b._id].level - ROLE_LIST[a._id].level
  })
  res.send(JSON.stringify({
    code: 0,
    msg: null,
    data
  }))
})

module.exports = router
