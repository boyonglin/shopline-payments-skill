/**
 * SHOPLINE Payments - Checkout Session
 * Node.js 建立結帳交易完整範例
 */

const fetch = require('node-fetch');

// 環境設定
const CONFIG = {
  sandbox: {
    baseUrl: 'https://api-sandbox.shoplinepayments.com',
    merchantId: process.env.SHOPLINE_MERCHANT_ID,
    apiKey: process.env.SHOPLINE_API_KEY
  },
  production: {
    baseUrl: 'https://api.shoplinepayments.com',
    merchantId: process.env.SHOPLINE_MERCHANT_ID,
    apiKey: process.env.SHOPLINE_API_KEY
  }
};

/**
 * 建立結帳交易
 * @param {Object} orderData - 訂單資料
 * @param {string} env - 環境：'sandbox' 或 'production'
 * @returns {Promise<Object>} - 結帳交易回應
 */
async function createCheckoutSession(orderData, env = 'sandbox') {
  const config = CONFIG[env];
  const url = `${config.baseUrl}/api/v1/trade/sessions/create`;
  const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // 建構請求電文
  const payload = {
    referenceId: orderData.orderId,
    language: orderData.language || 'zh-TW',
    amount: {
      value: Math.round(orderData.amount * 100), // 轉換為分
      currency: 'TWD'
    },
    expireTime: orderData.expireTime || 360, // 預設 360 分鐘（官方預設值）
    returnUrl: orderData.returnUrl,
    mode: 'regular',
    allowPaymentMethodList: orderData.paymentMethods || ['CreditCard', 'LinePay'],
    paymentMethodOptions: buildPaymentMethodOptions(orderData),
    order: buildOrderInfo(orderData),
    customer: buildCustomerInfo(orderData),
    billing: buildBillingInfo(orderData),
    client: {
      ip: orderData.clientIp || '127.0.0.1',
      userAgent: orderData.userAgent || 'Node.js',
      language: orderData.language || 'zh-TW'
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'merchantId': config.merchantId,
        'apiKey': config.apiKey,
        'requestId': requestId
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new ShoplinePaymentError(result.code, result.msg, result);
    }

    return {
      success: true,
      sessionId: result.sessionId,
      referenceId: result.referenceId,
      status: result.status,
      sessionUrl: result.sessionUrl,
      createTime: result.createTime
    };
  } catch (error) {
    if (error instanceof ShoplinePaymentError) {
      throw error;
    }
    throw new Error(`Network error: ${error.message}`);
  }
}

/**
 * 建構付款方式選項
 */
function buildPaymentMethodOptions(orderData) {
  const options = {};

  // 信用卡分期設定
  if (orderData.paymentMethods?.includes('CreditCard')) {
    options.CreditCard = {
      installmentCounts: orderData.installments || ['0']
    };
  }

  // ATM 虛擬帳號期限
  if (orderData.paymentMethods?.includes('VirtualAccount')) {
    options.VirtualAccount = {
      // 官方預設 4320 分鐘（3天），此處設為 1440 分鐘（1天）為業務需求
      paymentExpireTime: orderData.atmExpireTime || 1440
    };
  }

  // 街口支付期限
  if (orderData.paymentMethods?.includes('JKOPay')) {
    options.JKOPay = {
      // 官方預設 60 分鐘，此處設為 120 分鐘（官方範例值）
      paymentExpireTime: orderData.jkoExpireTime || 120
    };
  }

  // 中租 BNPL 設定
  if (orderData.paymentMethods?.includes('ChaileaseBNPL')) {
    options.ChaileaseBNPL = {
      installmentCounts: orderData.bnplInstallments || ['3', '6', '12'],
      // 官方預設 4320 分鐘，此處設為 120 分鐘（官方範例值）
      paymentExpireTime: orderData.bnplExpireTime || 120
    };
  }

  return options;
}

/**
 * 建構訂單資訊
 */
function buildOrderInfo(orderData) {
  const order = {};

  // 商品資訊
  if (orderData.products && orderData.products.length > 0) {
    order.products = orderData.products.map(product => ({
      id: product.id,
      name: product.name,
      quantity: product.quantity || 1,
      amount: {
        value: Math.round(product.price * 100),
        currency: 'TWD'
      },
      sku: product.sku,
      desc: product.description,
      url: product.url
    }));
  }

  // 配送資訊
  if (orderData.shipping) {
    order.shipping = {
      shippingMethod: orderData.shipping.method || '宅配',
      carrier: orderData.shipping.carrier,
      personalInfo: {
        firstName: orderData.shipping.name,
        email: orderData.shipping.email,
        phone: orderData.shipping.phone
      },
      address: {
        countryCode: 'TW',
        city: orderData.shipping.city,
        district: orderData.shipping.district,
        street: orderData.shipping.address,
        postcode: orderData.shipping.postcode
      }
    };
  }

  return order;
}

/**
 * 建構顧客資訊
 * 注意：personalInfo.lastName 為必填欄位
 */
function buildCustomerInfo(orderData) {
  if (!orderData.customer) {
    throw new Error('customer 為必填物件');
  }

  // 拆分姓名為 firstName 和 lastName
  const { firstName, lastName } = splitName(orderData.customer.name);

  return {
    referenceCustomerId: orderData.customer.id,
    type: orderData.customer.type || '0', // 0: 個人, 1: 公司
    personalInfo: {
      firstName: firstName,
      lastName: lastName, // 官方 API 必填
      email: orderData.customer.email,
      phone: orderData.customer.phone
    }
  };
}

/**
 * 建構帳單資訊（必填）
 * 注意：personalInfo.lastName 為必填欄位
 */
function buildBillingInfo(orderData) {
  // billing 為必填，若未提供則使用 customer 資訊
  const billingData = orderData.billing || orderData.customer;
  if (!billingData) {
    throw new Error('billing 或 customer 為必填物件');
  }

  const { firstName, lastName } = splitName(billingData.name);

  return {
    personalInfo: {
      firstName: firstName,
      lastName: lastName, // 官方 API 必填
      email: billingData.email,
      phone: billingData.phone
    }
  };
}

/**
 * 拆分中文姓名為姓和名
 * 預設第一個字為姓，其餘為名
 */
function splitName(fullName) {
  if (!fullName) {
    return { firstName: '', lastName: '' };
  }
  const name = fullName.trim();
  if (name.length <= 1) {
    return { firstName: name, lastName: name };
  }
  return {
    lastName: name.substring(0, 1),  // 姓
    firstName: name.substring(1)      // 名
  };
}

/**
 * 自訂錯誤類別
 */
class ShoplinePaymentError extends Error {
  constructor(code, message, response) {
    super(message);
    this.name = 'ShoplinePaymentError';
    this.code = code;
    this.response = response;
  }
}

// ============= 使用範例 =============

async function example() {
  try {
    const result = await createCheckoutSession({
      orderId: `ORDER-${Date.now()}`,
      amount: 1000, // NT$1000
      returnUrl: 'https://your-domain.com/payment/return',
      paymentMethods: ['CreditCard', 'LinePay', 'VirtualAccount'],
      installments: ['0', '3', '6', '12'],
      customer: {
        id: 'CUST-001',
        name: '王小明',
        email: 'customer@example.com',
        phone: '+886912345678'
      },
      products: [{
        id: 'PROD-001',
        name: '測試商品',
        price: 1000,
        quantity: 1
      }],
      shipping: {
        name: '王小明',
        phone: '+886912345678',
        city: '台北市',
        district: '松山區',
        address: '敦化北路170號10樓',
        postcode: '105405'
      },
      clientIp: '127.0.0.1'
    }, 'sandbox');

    console.log('結帳交易建立成功！');
    console.log('Session ID:', result.sessionId);
    console.log('付款頁面 URL:', result.sessionUrl);
    console.log('請將顧客導轉至付款頁面');

  } catch (error) {
    if (error instanceof ShoplinePaymentError) {
      console.error(`SHOPLINE 錯誤 [${error.code}]: ${error.message}`);
    } else {
      console.error('錯誤:', error.message);
    }
  }
}

// 執行範例
// example();

module.exports = {
  createCheckoutSession,
  ShoplinePaymentError
};
