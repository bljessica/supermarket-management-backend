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
    type: Number,
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
  price: { // 售价
    type: Number,
    required: true
  },
  purchasePrice: { // 进价
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
  name: {
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
    type: Number
  },
  endTime: {
    type: Number
  },
  purchaseStatus: {
    type: String,
    default: '未开始',
    enum: ['未开始', '采购完成', '订单完成']
  },
  inventoryLocation: {
    type: String,
    default: '默认仓库'
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
    type: Number
  },
  inventory: {
    type: Number,
  },
  operatorAccount: {
    type: String
  },
  remark: {
    type: String,
    default: ''
  }
})

const salesSchema = new Schema({
  orderId: {
    type: String,
    required: true
  },
  productId: {
    type: Schema.ObjectId
  },
  salesVolume: {
    type: Number
  },
  sellerAccount: {
    type: String
  },
  createTime: {
    type: Number
  },
  remark: {
    type: String
  }
})
salesSchema.index({orderId: 1, productId: 1}, {unique: true})

const chatSchema = new Schema({
  senderAccount: {
    type: String
  },
  recipientAccount: {
    type: String
  },
  content: {
    type: String,
    default: ''
  },
  time: {
    type: Number
  }
})
const userRoleChangeSchema = new Schema({
  operatorAccount: {
    type: String
  },
  operatedAccount: {
    type: String
  },
  roleBefore: {
    type: String
  },
  roleAfter: {
    type: String
  },
  time: {
    type: Number
  }
})
userRoleChangeSchema.index({operatorAccount: 1, operatedAccount: 1, time: 1}, {unique: true})



exports.User = mongoose.model('User', userSchema)
exports.Product = mongoose.model('Product', productSchema)
exports.Purchase = mongoose.model('Purchase', purchaseSchema)
exports.ProductInventoryChange = mongoose.model('ProductInventoryChange', productInventoryChangeSchema)
exports.Sales = mongoose.model('Sales', salesSchema)
exports.Chat = mongoose.model('Chat', chatSchema)
exports.UserRoleChange = mongoose.model('UserRoleChange', userRoleChangeSchema)
