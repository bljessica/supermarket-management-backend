const users = []

let io = null

//获取io  
const getSocketIo = function(server){  
  io = require('socket.io')(server, {cors: true}) 
  io.on('connection', (socket) => {
    console.log('connected')
    const socketId = socket.id
    // 用户登录
    socket.on('userLogin', (account) => {
      if (users.findIndex(user => (user.account === account)) === -1) {
        users.push({
          account,
          socketId
        })
      }
      console.log('userLogin', users)
    })
    // 用户发消息
    socket.on('sendMsg', account => {
      const receiverSocketId = users.find(user => (user.account === account))?.socketId
      if (receiverSocketId) {
        io.sockets.to(receiverSocketId).emit('newMsg')
      }
    })
  })
}

module.exports.getSocketIo = getSocketIo