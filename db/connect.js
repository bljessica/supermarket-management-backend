const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { ROLE_LIST } = require('../constants/constants')

// 使用原生promise，mongoose自带promise不再支持
// mongoose.Promise = global.Promise

const url = 'mongodb://127.0.0.1/supermarket'

mongoose.set('useCreateIndex', true)
mongoose.connect(url, { useUnifiedTopology: true, useNewUrlParser: true })
  .then(() => console.log('数据库连接成功'))
  .catch((err) => console.log('数据库连接失败' + err))

const db = mongoose.connection

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
    type: String,
    required: true
  }
})

const productSchema = new Schema({
  productName: {
    type: String,
    required: true,
    unique: true
  },
  image: {
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
    default: '售罄'
  }
})

const purchaseSchema = new Schema({
  orderId: {
    type: String,
    required: true
  },
  productName: {
    type: String,
    required: true,
    ref: 'Product'
  },
  purchaseQuantity: {
    type: Number
  },
  purchaserAccount: {
    type: String
  },
  purchaserName: {
    type: String
  },
  purchaseTime: {
    type: String,
    required: true
  },
  purchaseStatus: {
    type: String,
    default: '未开始'
  },
  remark: {
    type: String,
    default: ''
  }
})
purchaseSchema.index({orderId: 1, productName: 1}, {unique: true})

exports.User = mongoose.model('User', userSchema)
exports.Product = mongoose.model('Product', productSchema)
exports.Purchase = mongoose.model('Purchase', purchaseSchema)
