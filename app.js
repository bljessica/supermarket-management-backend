const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
// require('express-async-errors')
const authRouter = require('./routes/auth')
const productRouter = require('./routes/product')
const purchaseRouter = require('./routes/purchase')
const productInventoryChangeRouter = require('./routes/productInventoryChange')
const salesRouter = require('./routes/sales')
const userRouter = require('./routes/user')
const chatRouter = require('./routes/chat')
const userRoleChangeRouter = require('./routes/userRoleChange')
const saveAdminUser = require('./utils/saveAdminUser')

const app = express()

//设置跨域访问
app.all('*', (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Credentials", "true")
  res.setHeader("Access-Control-Allow-Methods", "*")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Access-Token")
  res.setHeader("Access-Control-Expose-Headers", "*")

  if (req.method == "OPTIONS") {
    res.sendStatus(200)
    return
  }
  next()
})

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', authRouter)
app.use('/', productRouter)
app.use('/', purchaseRouter)
app.use('/', productInventoryChangeRouter)
app.use('/', salesRouter)
app.use('/', userRouter)
app.use('/', chatRouter)
app.use('/', userRoleChangeRouter)

saveAdminUser().then(() => {
  console.log('管理员账号存储成功')
})

module.exports = app
