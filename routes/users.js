const express = require('express');
const router = express.Router();
const { User } = require('../db/connect')

router.post('/addUser', function (req, res, next) {
  let obj = req.body
  User.create(obj, (err) => {
    if (err) {
      res.send(JSON.stringify({
        code: 1,
        msg: err
      }))
      console.log(err)
    } else {
      res.send(JSON.stringify({
        code: 0,
        msg: '成功添加用户'
      }))
    }
  })
  
})

module.exports = router
