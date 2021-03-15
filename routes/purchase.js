const express = require('express')
const router = express.Router()
const { Purchase, User, Product } = require('../db/connect')

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
  // let obj = req.query
  const data = await Purchase.aggregate([
    {
      $group: {
        "_id":"$orderId","orders":{"$push":"$$ROOT"}, //$$ROOT按每个名称保留整个文档
        count: { $sum: 1 }
      }
    }, 
    {
      $sort: {_id: -1} // 按订单号排序
    }
  ])
  res.send(JSON.stringify({
    code: 0,
    msg: null,
    data
  }))
})

router.put('/changePurchaseOrderStatus', async(req, res) => {
  let obj = req.body
  await Purchase.updateMany({orderId: obj.orderId}, {purchaseStatus: obj.purchaseStatus})
  if (obj.purchaseStatus === '已完成') {
    const records = await Purchase.find({orderId: obj.orderId})
    records.forEach(async(record) => {
      const product = await Product.findOne({productName: record.productName})
      await Product.updateOne({productName: record.productName}, 
      {inventory: parseInt(product.inventory) + parseInt(record.purchaseQuantity), status: '正常'})
    })
  }
  res.send(JSON.stringify({
    code: 0,
    msg: null
  }))
})

module.exports = router
