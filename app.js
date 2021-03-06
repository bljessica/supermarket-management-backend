const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
// require('express-async-errors')
const usersRouter = require('./routes/user')
const authRouter = require('./routes/auth')

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

app.use('/', usersRouter)
app.use('/', authRouter)

module.exports = app
