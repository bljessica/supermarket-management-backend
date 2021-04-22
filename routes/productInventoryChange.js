const dayjs = require('dayjs')
const express = require('express')
const router = express.Router()
const { ProductInventoryChange } = require('../db/connect')

router.get('/productInventoryChange', async(req, res) => {
  const obj = req.query
  // 联表查询
  const data = await ProductInventoryChange.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'operatorAccount',
        foreignField: 'account',
        as: 'users'
      }
    },
    {
      $unwind: '$users'
    },
    {$match: {productId: obj._id}},
    {$sort: {time: -1}}
  ])
  for(let item of data) {
    item.time = dayjs(item.time).format('YYYY/MM/DD HH:mm:ss')
  }
  res.send(JSON.stringify({
    code: 0,
    msg: null,
    data
  }))
})

module.exports = router
