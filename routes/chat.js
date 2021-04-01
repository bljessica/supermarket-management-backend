const express = require('express')
const router = express.Router()
const { Chat } = require('../db/connect')

router.post('/sendMsg', async(req, res) => {
  const obj = req.body
  await Chat.create(obj)
  res.send(JSON.stringify({
    code: 0,
    msg: null
  }))
})

router.get('/chatHistory', async(req, res) => {
  const obj = req.query
  const dataSend = await Chat.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'senderAccount',
        foreignField: 'account',
        as: 'user'
      },
    },
    {$unwind: '$user'},
    {$match: {senderAccount: obj.senderAccount, recipientAccount: obj.recipientAccount}}
  ])
  const dataReceive = await Chat.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'senderAccount',
        foreignField: 'account',
        as: 'user'
      },
    },
    {$unwind: '$user'},
    {$match: {senderAccount: obj.recipientAccount, recipientAccount: obj.senderAccount}}
  ])
  res.send(JSON.stringify({
    code: 0,
    msg: null,
    data: dataSend.concat(dataReceive).sort((a, b) => (a.time - b.time))
  }))
})

module.exports = router
