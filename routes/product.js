const express = require('express')
const { Product, Purchase, Sales, ProductInventoryChange } = require('../db/connect')
const mongoose = require('mongoose')
const router = express.Router()
const dayjs = require('dayjs')

router.post('/addProduct', async (req, res) => {
  const obj = req.body
  const product = await Product.findOne({
    productName: obj.productName
  })
  if (product) {
    res.send(JSON.stringify({
      code: 1,
      msg: '该商品已存在'
    }))
  } else {
    await Product.create({
      ...obj,
      status: obj.inventory === 0 ? '售罄' : '正常'
    })
    res.send(JSON.stringify({
      code: 0,
      msg: '添加成功'
    }))
  }
})

router.get('/product', async(req, res) => {
  const obj = req.query
  if (obj.productName) {
    obj.productName = unescape(obj.productName)
  }
  const data = await Product.findOne(obj)
  res.send(JSON.stringify({
    code: 0,
    msg: null,
    data
  }))
})

router.get('/allProducts', async(req, res) => {
  const obj = req.query
  let filters = {}
  if (obj.status) {
    filters = {
      status: obj.status
    }
  }
  const total = await Product.find({...filters, productName: new RegExp(obj.searchText || '', 'i')}).count()
  const data = await Product.find({...filters, productName: new RegExp(obj.searchText || '', 'i')})
    .skip((obj.pageSize || 0) * ((obj.pageIdx - 1) || 0)).sort({inventory: -1, _id: -1}).limit(parseInt(obj.pageSize))
  res.send(JSON.stringify({
    code: 0,
    msg: null,
    data,
    total
  }))
})

router.get('/allProductNames', async (req, res) => {
  const obj = req.query
  let data = null
  if (obj.inventory) { // 有库存的商品
    data = await Product.find({inventory: {'$gt': 0}},
      {productName: 1, _id: 0}).sort({_id: -1})
  } else { // 库存未满且不在某未完成采购订单中的商品
    data = await Product.aggregate([
      {$sort: {_id: -1}},
      {
        $lookup: {
          from: 'purchases',
          localField: '_id',
          foreignField: 'productId',
          as: 'purchaseOrders'
        }
      },
      {
        $project: {
          productName: 1,
          canPurchase: {$lt: ['$inventory', '$inventoryCeiling']}, // 库存未满
          _id: 0,
          purchaseOrders: { // 筛选采购订单状态为未开始
            $filter: {
              input: '$purchaseOrders',
              as: 'order',
              cond: {$eq: ['$$order.purchaseStatus', '未开始']}
            }
          }
        }
      },
      {$match: {'purchaseOrders': [], canPurchase: true}}
    ])
  }
  res.send(JSON.stringify({
    code: 0,
    msg: null,
    data
  }))
})

router.delete('/deleteProduct', async(req, res) => {
  const obj = req.body
  await Product.deleteOne({
    productName: obj.productName
  })
  // 相关表删除记录
  await Purchase.deleteMany({productId: mongoose.Types.ObjectId(obj._id)})
  await Sales.deleteMany({productId: mongoose.Types.ObjectId(obj._id)})
  await ProductInventoryChange.deleteMany({productId: obj._id})
  res.send(JSON.stringify({
    code: 0,
    msg: '删除成功'
  }))
})

router.delete('/deleteProducts', async(req, res) => {
  const obj = req.body
  if (!obj.checkedList.length) {
    res.send(JSON.stringify({
      code: 1,
      msg: '请先选择商品'
    }))
    return
  }
  await Product.deleteMany({
    productName: {'$in': obj.checkedList.map(item => item.productName)}
  })
  // 相关表删除记录
  const _ids = obj.checkedList.map(item => mongoose.Types.ObjectId(item._id))
  await Purchase.deleteMany({productId: {$in: _ids}})
  await Sales.deleteMany({productId: {$in: _ids}})
  await ProductInventoryChange.deleteMany({productId: {$in: obj.checkedList.map(item => (item._id))}})
  res.send(JSON.stringify({
    code: 0,
    msg: '删除成功'
  }))
})

router.put('/editProduct', async(req, res) => {
  const obj = req.body
  // 判断是否重名
  const product = await Product.findOne({productName: obj.productName})
  if (product) {
    res.send(JSON.stringify({
      code: 1,
      msg: '存在同名商品'
    }))
    return
  }
  await Product.updateOne({
    _id: obj._id
  }, {
    ...obj,
    status: obj.inventory === 0 ? '售罄' : '正常'
  })
  res.send(JSON.stringify({
    code: 0,
    msg: '修改成功'
  }))
})

router.get('/productSuggest', async(req, res) => {
  const startTime = dayjs().startOf('month').valueOf()
  const endTime = dayjs().endOf('month').valueOf()
  const data = await Sales.aggregate([
    {
      $lookup: {
        from: 'products',
        localField: 'productId',
        foreignField: '_id',
        as: 'product'
      },
    },
    {$unwind: '$product'},
    {$match: {createTime: {'$gte': startTime, '$lt': endTime}}},
    {$group: {
      _id: '$product.productName',
      id: {$first: '$product._id'},
      price: {$first: '$product.price'},
      num: {$sum: '$salesVolume'},
      image: {$first: '$product.image'}
    }},
    {$project: {
      price: 1,
      image: 1,
      id: 1,
      num: 1, // 总销量
      amount: {$multiply: ['$price', '$num']}, // 总销售额
      profit: {$multiply: [{$subtract: ['$price', '$purchasePrice']}, '$num']}
    }},
    {$limit: 20}
  ])
  res.send(JSON.stringify({
    code: 0,
    msg: null,
    data
  }))
})

module.exports = router
