const express = require('express')
const router = express.Router()
const { Sales, Product, ProductInventoryChange, User } = require('../db/connect')
const dayjs = require('dayjs')

router.post('/addSalesOrder', async(req, res) => {
  const obj = req.body
  for(let item of obj.items) {
    const product = await Product.findOne({productName: item.productName})
    // 添加销售记录
    await Sales.create({
      orderId: obj.orderId,
      remark: obj.remark,
      sellerAccount: obj.sellerAccount,
      createTime: obj.createTime,
      productId: product._id,
      salesVolume: item.salesVolume
    })
    // 更改商品库存
    const inventory = parseInt(product.inventory) - parseInt(item.salesVolume)
      await Product.updateOne({_id: product._id}, 
      {inventory, status: inventory === 0 ? '售罄' : '正常'})
      await ProductInventoryChange.create({
        productId: product._id,
        inventory,
        type: '卖出',
        num: item.salesVolume,
        time: obj.createTime,
        operatorAccount: obj.sellerAccount,
        remark: obj.remark
      })
  }
  res.send(JSON.stringify({
    code: 0,
    msg: '创建成功'
  }))
})

router.delete('/salesOrder', async(req, res) => {
  const obj = req.body
  const salesRecords = await Sales.find({orderId: obj.orderId})
  await Sales.deleteMany({orderId: obj.orderId})
  // 还原商品库存
  for(let item of salesRecords) {
    const product = await Product.findOne({_id: item.productId})
    const total = parseInt(product.inventory) + parseInt(item.salesVolume)
    const inventory = total > product.inventoryCeiling ? product.inventoryCeiling : total
      await Product.updateOne({_id: item.productId}, {inventory, status: '正常'})
      await ProductInventoryChange.deleteMany({
        productId: item.productId,
        type: '卖出',
        time: item.createTime,
        operatorAccount: item.sellerAccount
      })
  }
  res.send(JSON.stringify({
    code: 0,
    msg: '删除成功'
  }))
})

router.get('/allSalesOrders', async(req, res) => {
  // const obj = req.query
  const data = await Sales.aggregate([
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
      const user = await User.findOne({account: order.sellerAccount})
      order.sellerName = user.username
      order.sellerAccount = user.account
      order.createTime = dayjs(order.createTime).format('YYYY/MM/DD HH:mm:ss')
    }
  }
  res.send(JSON.stringify({
    code: 0,
    msg: null,
    data
  }))
})

router.get('/totalSales', async(req, res) => {
  const obj = req.query
  const type = obj.type || 'week'
  let startTime = null
  let endTime = null
  if (type === 'week') {
    startTime = dayjs().startOf(type).add(1, 'day').valueOf()
    endTime = dayjs().endOf(type).add(1, 'day').valueOf()
  } else {
    startTime = dayjs().startOf(type).valueOf()
    endTime = dayjs().endOf(type).valueOf()
  }
  let breaksBetween = null
  let breakType = 'day'
  if (type === 'year') {
    breaksBetween = dayjs(endTime).diff(dayjs(startTime), 'month')
    breakType = 'month'
  } else {
    breaksBetween = dayjs(endTime).diff(dayjs(startTime), 'day')
  }
  const data = []
  for(let i = 0; i <= breaksBetween; i++) {
    let dayStartTime = dayjs(startTime).add(i, breakType).valueOf()
    let dayEndTime = dayjs(startTime).add(i + 1, breakType).valueOf()
    const sales = await Sales.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product'
        },
      },
      {$unwind: '$product'},
      {$match: {createTime: {'$gte': dayStartTime, '$lt': dayEndTime}}}
    ])
    let total = 0
    let totalCost = 0
    for(let item of sales) {
      total += item.salesVolume * item.product.price
      totalCost += item.salesVolume * item.product.purchasePrice
    }
    data.push({
      totalSales: total.toFixed(1),
      totalProfit: (total - totalCost).toFixed(1),
      startTime: dayjs(dayStartTime).format('YYYY/MM/DD HH:mm:ss'),
      endTime: dayjs(dayEndTime).format('YYYY/MM/DD HH:mm:ss')
    })
  }
  res.send(JSON.stringify({
    code: 0,
    msg: null,
    data
  }))
})

router.get('/salesReport', async(req, res) => {
  const obj = req.query
  const type = obj.type || 'week'
  let startTime = null
  let endTime = null
  if (type === 'week') {
    startTime = dayjs().startOf(type).add(1, 'day').valueOf()
    endTime = dayjs().endOf(type).add(1, 'day').valueOf()
  } else {
    startTime = dayjs().startOf(type).valueOf()
    endTime = dayjs().endOf(type).valueOf()
  }
  const data = await Sales.aggregate([
    {
      $lookup: {
        from: 'products',
        localField: 'productId',
        foreignField: '_id',
        as: 'product'
      }
    },
    {$unwind: '$product'},
    {$match: {createTime: {$gte: startTime, $lt: endTime}}},
    {$group: {
      _id: '$product.productName',
      price: {$first: '$product.price'},
      unit: {$first: '$product.unit'},
      purchasePrice: {$first: '$product.purchasePrice'},
      num: {$sum: '$salesVolume'}
    }},
    {$project: {
      price: 1,
      num: 1,
      unit: 1,
      amount: {$multiply: ['$price', '$num']},
      profit: {$multiply: [{$subtract: ['$price', '$purchasePrice']}, '$num']}
    }},
    {$sort: {profit: -1}}
  ])
  data.forEach(item => {
    item.amount = item.amount.toFixed(1)
    item.profit = item.profit.toFixed(1)
  })
  res.send(JSON.stringify({
    code: 0,
    msg: null,
    data
  }))
})

module.exports = router
