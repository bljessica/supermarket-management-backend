const { Product } = require('../db/connect')
const fs = require('fs')

async function saveProducts () {
  const data = fs.readFileSync('data/jd_products.txt', 'utf8')
  const dataArr = data.split('\n')
  for(let line of dataArr) {
    const arr = line.split(',')
    const jdIdx = arr[0].indexOf('京东超市')
    const name = jdIdx === -1 ? arr[0] : (arr[0].substring(0, jdIdx) + arr[0].substring(jdIdx + 5))
    const product = await Product.findOne({productName: name})
    if (!product && !isNaN(parseFloat(arr[1]))) {
      await Product.create({
        productName: name,
        price: arr[1],
        purchasePrice: (0.9 * parseFloat(arr[1])).toFixed(1),
        image: arr[5],
        unit: '份',
        inventory: 0,
        inventoryCeiling: 5000
      })
    }
  }
}

(async function (){
  console.log('开始存储商品数据...')
  await saveProducts()
  console.log('商品数据存储完毕')
  process.exit()
})()

