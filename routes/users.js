const express = require('express');
const router = express.Router();
const { User } = require('../db/connect')

router.post('/addUser', async (req, res, next) => {
  let obj = req.body
  const user = await User.findOne({ account: obj.account })
  if (!user) {
    await User.create(obj)
    res.send(JSON.stringify({
      code: 0,
      msg: '成功添加用户'
    }))
  } else {
    res.send(JSON.stringify({
      code: 1,
      msg: '该手机号或邮箱已被占用'
    }))
  }
})

module.exports = router
