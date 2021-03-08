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
    await Product.create(obj)
    res.send(JSON.stringify({
      code: 0,
      msg: '添加成功'
    }))
  }
})

router.get('/allProducts', async(req, res) => {
  const data = await Product.find()
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


module.exports = router
