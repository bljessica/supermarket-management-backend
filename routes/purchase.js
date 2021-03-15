const express = require('express')
const router = express.Router()
const { Purchase, Product, User, ProductInventoryChange } = require('../db/connect')

router.post('/addPurchaseOrder', async(req, res) => {
  let obj = req.body
  for(let item of obj.items) {
    const product = await Product.findOne({productName: item.productName})
    await Purchase.create({
      orderId: obj.orderId,
      remark: obj.remark,
      purchaserAccount: obj.purchaserAccount,
      createTime: obj.createTime,
      productId: product._id,
      purchaseQuantity: item.purchaseQuantity
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
  // forEach 不会等待异步任务
  for(let item of data) {
    for(let order of item.orders) {
      const product = await Product.findOne({_id: order.productId})
      order.productName = product.productName
      const user = await User.findOne({account: order.purchaserAccount})
      order.purchaserName = user.username
    }
  }
  res.send(JSON.stringify({
    code: 0,
    msg: null,
    data
  }))
})

router.put('/changePurchaseOrderStatus', async(req, res) => {
  let obj = req.body
  await Purchase.updateMany({orderId: obj.orderId}, {purchaseStatus: obj.purchaseStatus, endTime: obj.endTime})
  if (obj.purchaseStatus === '已完成') {
    const records = await Purchase.find({orderId: obj.orderId})
    for(let record of records) {
      const product = await Product.findOne({_id: record.productId})
      const inventory = parseInt(product.inventory) + parseInt(record.purchaseQuantity)
      await Product.updateOne({_id: record.productId}, 
      {inventory, status: '正常'})
      await ProductInventoryChange.create({
        productId: product._id,
        inventory,
        type: '购入',
        num: record.purchaseQuantity,
        time: obj.endTime,
        operatorAccount: obj.operatorAccount
      })
    }
  }
  res.send(JSON.stringify({
    code: 0,
    msg: null
  }))
})

module.exports = router
