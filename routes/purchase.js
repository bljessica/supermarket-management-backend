const express = require('express')
const router = express.Router()
const { Purchase, User } = require('../db/connect')

router.post('/addPurchaseOrder', async(req, res) => {
  let obj = req.body
  const user = await User.findOne({account: obj.purchaserAccount})
  for(let item of obj.items) {
    await Purchase.create({
      orderId: obj.orderId,
      remark: obj.remark,
      purchaserAccount: obj.purchaserAccount,
      purchaserName: user.username,
      purchaseTime: obj.purchaseTime,
      ...item
    })
  }
  res.send(JSON.stringify({
    code: 0,
    msg: '创建成功'
  }))
})

router.get('/allPurchaseOrders', async(req, res) => {
  let obj = req.query
  const data = await Purchase.find(obj)
  res.send(JSON.stringify({
    code: 0,
    msg: null,
    data
  }))
})

module.exports = router
