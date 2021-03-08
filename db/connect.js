const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { ROLE_LIST } = require('../constants/constants')

// 使用原生promise，mongoose自带promise不再支持
// mongoose.Promise = global.Promise

const url = 'mongodb://127.0.0.1/supermarket'

mongoose.set('useCreateIndex', true);
mongoose.connect(url, { useUnifiedTopology: true, useNewUrlParser: true })
  .then(() => console.log('数据库连接成功'))
  .catch((err) => console.log('数据库连接失败' + err))

const db = mongoose.connection;

//集合规则
const userSchema = new Schema({
  account: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  username: {
    type: String,
    default: '新用户'
  },
  role: { //职位
    type: String,
    enum: Object.keys(ROLE_LIST)
  },
  avatar: {
    type: String,
    default: ''
  },
  entryTime: { // 入职时间
    type: Date,
    default: Date.now()
  }
})

const productSchema = new Schema({
  productName: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  inventory: {
    type: Number,
    required: true
  },
  inventoryCeiling: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    default: '正常'
  }
})

exports.User = mongoose.model('User', userSchema)
exports.Product = mongoose.model('Product', productSchema)
