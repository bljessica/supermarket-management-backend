var socket_io = {}  

//获取io  
socket_io.getSocketio = function(server){  
  const io = require('socket.io')(server, {cors: true}) 
  io.on('connection', (socket) => {
    console.log('connected')
    socket.on('userLogin', (info) => {
      console.log('userLogin', info)
    })
  })
};  

module.exports = socket_io