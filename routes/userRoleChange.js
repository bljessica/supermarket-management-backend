const express = require('express')
const router = express.Router()
const { UserRoleChange } = require('../db/connect')
const dayjs = require('dayjs')

router.get('/userRoleChangeRecords', async(req, res) => {
  const data = await UserRoleChange.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'operatorAccount',
        foreignField: 'account',
        as: 'operator'
      },
    },
    {$unwind: '$operator'},
    {
      $lookup: {
        from: 'users',
        localField: 'operatedAccount',
        foreignField: 'account',
        as: 'operated'
      },
    },
    {$unwind: '$operated'},
    {$sort: {time: -1}}
  ])
  for(let record of data) {
    record.time = dayjs(record.time).format('YYYY/MM/DD HH:mm:ss')
  }
  res.send(JSON.stringify({
    code: 0,
    msg: null,
    data
  }))
})

module.exports = router
