const express = require('express')
const { Product } = require('../db/connect')
const router = express.Router()

router.post('/addProduct', async (req, res) => {
  let obj = req.body
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
  let obj = req.query
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
  let obj = req.query
  let filters = {}
  if (obj.status) {
    filters = {
      status: obj.status
    }
  }
  const total = await Product.find({...filters, productName: new RegExp(obj.searchText || '', 'i')}).count()
  const data = await Product.find({...filters, productName: new RegExp(obj.searchText || '', 'i')})
    .skip((obj.pageSize || 0) * ((obj.pageIdx - 1) || 0)).sort({inventory: -1}).limit(10)
  res.send(JSON.stringify({
    code: 0,
    msg: null,
    data,
    total
  }))
})

router.get('/allProductNames', async (req, res) => {
  let obj = req.query
  let data = null
  if (obj.inventory) { // 有库存的商品
    data = await Product.find({inventory: {'$gt': 0}},
      {productName: 1, _id: 0})
  } else { // 库存未满且不在某未完成采购订单中的商品
    data = await Product.aggregate([
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
    productName: {'$in': obj.checkedList}
  })
  res.send(JSON.stringify({
    code: 0,
    msg: '删除成功'
  }))
})

router.put('/editProduct', async(req, res) => {
  let obj = req.body
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

module.exports = router
