exports.ROLE_LIST = {
  '普通职员': { 
    auth: ['VIEW_ALL']
  },
  '采购员': { 
    auth: ['VIEW_ALL', 'PURCHASE_SELF']
  },
  '销售员': { 
    auth: ['VIEW_ALL', 'SELL_SELF']
  },
  '采购总管': { 
    auth: ['VIEW_ALL', 'PURCHASE_ALL']
  },
  '销售总管': {
    auth: ['VIEW_ALL', 'SELL_ALL']
  },
  '总领导': { 
    auth: ['VIEW_ALL', 'PURCHASE_ALL', 'SELL_ALL']
  }
}
