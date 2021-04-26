const users = []

let io = null

//获取io  
const getSocketIo = function(server){  
  io = require('socket.io')(server, {cors: true}) 
  io.on('connection', (socket) => {
    console.log('socket connected')
    const socketId = socket.id
    // 用户登录
    socket.on('userLogin', (account) => {
      const user = users.find(user => (user.account === account))
      if (!user) {
        users.push({
          account,
          socketId
        })
      } else {
        user.socketId = socketId
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
    // 用户信息更新
    socket.on('userUpdate', () => {
      socket.broadcast.emit('someUserUpdate')
    })
  })
}

module.exports.getSocketIo = getSocketIo