const { Product } = require('../db/connect')
const fs = require('fs')

function saveProducts () {
  const data = fs.readFileSync('data/jd_products.txt', 'utf8')
  console.log('文件读取完成')
  data.split('\n').forEach(async (line, idx) => {
    const arr = line.split(',')
    const jdIdx = arr[0].indexOf('京东超市')
    await Product.create({
      productName: jdIdx === -1 ? arr[0] : (arr[0].substring(0, jdIdx) + arr[0].substring(jdIdx + 5)),
      price: arr[1],
      image: arr[5],
      unit: '份',
      inventory: 0,
      inventoryCeiling: 5000
    })
  })
}

saveProducts()
