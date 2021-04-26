const express = require('express')
const router = express.Router()
const { Purchase, Product, User, ProductInventoryChange } = require('../db/connect')
const dayjs = require('dayjs')

router.post('/addPurchaseOrder', async(req, res) => {
  const obj = req.body
  for(let item of obj.items) {
    const product = await Product.findOne({productName: item.productName})
    await Purchase.create({
      name: obj.name,
      orderId: obj.orderId,
      remark: obj.remark,
      inventoryLocation: obj.inventoryLocation,
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

router.delete('/purchaseOrder', async(req, res) => {
  const obj = req.body
  const purchaseOrders = await Purchase.find({orderId: obj.orderId})
  if (purchaseOrders[0].purchaseStatus === '订单完成') {
    for(let item of purchaseOrders) {
      const product = await Product.findOne({_id: item.productId})
      const total = parseInt(product.inventory) - parseInt(item.purchaseQuantity)
      const inventory = total > 0 ? total : 0
      await Product.updateOne({_id: item.productId}, {inventory, status: inventory === 0 ? '售罄' : '正常'})
      await ProductInventoryChange.deleteMany({
        productId: item.productId,
        type: '购入',
        time: item.endTime,
        operatorAccount: item.purchaserAccount
      })
    }
  } 
  await Purchase.deleteMany({orderId: obj.orderId})
  res.send(JSON.stringify({
    code: 0,
    msg: '删除成功'
  }))
})

router.get('/purchaseOrder', async(req, res) => {
  const obj = req.query
  const records = await Purchase.aggregate([
    {$match: {orderId: obj.orderId}},
    {
      $lookup: {
        from: 'products',
        localField: 'productId',
        foreignField: '_id',
        as: 'product'
      },
    },
    {$unwind: '$product'},
    {
      $lookup: {
        from: 'users',
        localField: 'purchaserAccount',
        foreignField: 'account',
        as: 'user'
      },
    },
    {$unwind: '$user'}
  ])
  const data = {
    orderId: {
      label: '订单ID',
      value: records[0].orderId
    },
    name: {
      label: '订单名',
      value: records[0].name
    },
    purchaserAccount: {
      label: '采购员账号',
      value: records[0].purchaserAccount
    },
    purchaserName: {
      label: '采购员昵称',
      value: records[0].user.username
    },
    inventoryLocation: {
      label: '库存地点',
      value: records[0].inventoryLocation
    },
    purchaseStatus: {
      label: '采购状态',
      value: records[0].purchaseStatus
    },
    createTime: {
      label: '创建时间',
      value: dayjs(records[0].createTime).format('YYYY/MM/DD HH:mm:ss')
    }
  }
  if (records[0].endTime) {
    data.endTime = {
      label: '完成时间',
      value: dayjs(records[0].endTime).format('YYYY/MM/DD HH:mm:ss')
    }
  }
  data.items = {
    label: '采购商品',
    value: records.map(record => {
      return {
        _id: record.product._id,
        productName: record.product.productName,
        purchaseQuantity: record.purchaseQuantity
      }
    })
  }
  data.remark = {
    label: '备注',
    value: records[0].remark
  }
  res.send(JSON.stringify({
    code: 0,
    msg: null,
    data
  }))
})

router.get('/allPurchaseOrders', async(req, res) => {
  const obj = req.query
  const total = (await Purchase.aggregate([
    {
      $group: {
        "_id":"$orderId" //$$ROOT按每个名称保留整个文档
      }
    }
  ])).length
  const data = await Purchase.aggregate([
    {
      $group: {
        "_id":"$orderId","orders":{"$push":"$$ROOT"}, //$$ROOT按每个名称保留整个文档
        count: { $sum: 1 }
      }
    }, 
    {
      $sort: {_id: -1} // 按订单号排序
    },
    {
      $skip: (obj.pageSize || 0) * ((obj.pageIdx - 1) || 0)
    },
    {
      $limit: parseInt(obj.pageSize)
    }
  ])
  // forEach 不会等待异步任务
  for(let item of data) {
    for(let order of item.orders) {
      const product = await Product.findOne({_id: order.productId})
      order.productName = product.productName
      const user = await User.findOne({account: order.purchaserAccount})
      order.purchaserName = user.username
      order.purchaserAccount = user.account
      order.createTime = dayjs(order.createTime).format('YYYY/MM/DD HH:mm:ss')
      order.endTime = order.endTime ? dayjs(order.endTime).format('YYYY/MM/DD HH:mm:ss') : ''
    }
  }
  res.send(JSON.stringify({
    code: 0,
    msg: null,
    data,
    total
  }))
})

router.put('/changePurchaseOrderStatus', async(req, res) => {
  const obj = req.body
  if (obj.purchaseStatus === '订单完成' || obj.purchaseStatus === '入库完成') {
    await Purchase.updateMany({orderId: obj.orderId}, {purchaseStatus: '订单完成', endTime: obj.endTime})
    const purchase = await Purchase.findOne({orderId: obj.orderId})
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
        operatorAccount: obj.operatorAccount,
        remark: purchase.remark
      })
    }
  } else {
    await Purchase.updateMany({orderId: obj.orderId}, {purchaseStatus: obj.purchaseStatus})
  }
  res.send(JSON.stringify({
    code: 0,
    msg: '变更成功'
  }))
})

module.exports = router
