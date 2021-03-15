const express = require('express')
const router = express.Router()
const { User, ProductInventoryChange } = require('../db/connect')

router.get('/productInventoryChange', async(req, res) => {
  let obj = req.query
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
  res.send(JSON.stringify({
    code: 0,
    msg: null,
    data
  }))
})

module.exports = router
