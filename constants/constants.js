exports.ROLE_LIST = {
  '普通职员': {
    auth: ['VIEW_ALL'],
    level: 1
  },
  '采购员': {
    auth: ['VIEW_ALL', 'PURCHASE_SELF'],
    level: 2
  },
  '销售员': {
    auth: ['VIEW_ALL', 'SELL_SELF'],
    level: 2
  },
  '采购总管': {
    auth: ['VIEW_ALL', 'PURCHASE_ALL'],
    level: 3
  },
  '销售总管': {
    auth: ['VIEW_ALL', 'SELL_ALL'],
    level: 3
  },
  '总领导': {
    auth: ['VIEW_ALL', 'PURCHASE_ALL', 'SELL_ALL'],
    level: 4
  }
}
