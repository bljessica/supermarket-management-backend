const express = require('express')
const { Product } = require('../db/connect')
const router = express.Router()

router.post('/addProduct', async (req, res, next) => {
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
    await Product.create(obj)
    res.send(JSON.stringify({
      code: 0,
      msg: '添加成功'
    }))
  }
})

router.get('/allProducts', async(req, res, next) => {
  const data = await Product.find()
  res.send(JSON.stringify({
    code: 0,
    msg: null,
    data
  }))
})

module.exports = router
