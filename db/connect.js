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
    default: '售罄',
    enum: ['售罄', '正常']
  }
})

const purchaseSchema = new Schema({
  orderId: {
    type: String,
    required: true
  },
  productId: {
    type: Schema.ObjectId
  },
  purchaseQuantity: {
    type: Number
  },
  purchaserAccount: {
    type: String
  },
  createTime: {
    type: String
  },
  endTime: {
    type: String
  },
  purchaseStatus: {
    type: String,
    default: '未开始',
    enum: ['未开始', '已完成']
  },
  remark: {
    type: String,
    default: ''
  }
})
purchaseSchema.index({orderId: 1, productId: 1}, {unique: true})

const productInventoryChangeSchema = new Schema({
  productId: {
    type: String
  },
  type: {
    type: String,
    enum: ['购入', '卖出']
  },
  num: {
    type: Number,
  },
  time: {
    type: String
  },
  inventory: {
    type: Number,
  },
  operatorAccount: {
    type: String
  }
})

const salesSchema = new Schema({
  orderId: {
    type: String,
    required: true
  },
  productId: {
    type: String
  },
  salesVolume: {
    type: Number
  },
  sellerAccount: {
    type: String
  },
  createTime: {
    type: String
  },
  remark: {
    type: String
  }
})
salesSchema.index({orderId: 1, productId: 1}, {unique: true})

exports.User = mongoose.model('User', userSchema)
exports.Product = mongoose.model('Product', productSchema)
exports.Purchase = mongoose.model('Purchase', purchaseSchema)
exports.ProductInventoryChange = mongoose.model('ProductInventoryChange', productInventoryChangeSchema)
exports.Sales = mongoose.model('Sales', salesSchema)
