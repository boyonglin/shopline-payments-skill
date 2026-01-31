/**
 * SHOPLINE Payments - Google Apps Script 整合
 * 用於 Google Apps Script 環境的完整範例
 */

// ============= 設定區 =============

// 將以下值設定在 Script Properties 中
// PropertiesService.getScriptProperties().setProperties({
//   'SHOPLINE_MERCHANT_ID': 'your-merchant-id',
//   'SHOPLINE_API_KEY': 'your-api-key',
//   'SHOPLINE_SIGN_KEY': 'your-sign-key'
// });

const SHOPLINE_CONFIG = {
  SANDBOX_URL: 'https://api-sandbox.shoplinepayments.com',
  PRODUCTION_URL: 'https://api.shoplinepayments.com'
};

/**
 * 取得設定值
 */
function getConfig(key) {
  return PropertiesService.getScriptProperties().getProperty(key);
}

// ============= 建立結帳交易 =============

/**
 * 建立結帳交易
 * @param {Object} orderData - 訂單資料
 * @param {boolean} isProduction - 是否為正式環境
 * @returns {Object} - 結帳交易回應
 */
function createCheckoutSession(orderData, isProduction = false) {
  const baseUrl = isProduction ? SHOPLINE_CONFIG.PRODUCTION_URL : SHOPLINE_CONFIG.SANDBOX_URL;
  const url = `${baseUrl}/api/v1/trade/sessions/create`;
  const requestId = Utilities.getUuid();

  // 拆分中文姓名：第一個字為姓，其餘為名
  const customerLastName = orderData.customerName ? orderData.customerName.substring(0, 1) : '';
  const customerFirstName = orderData.customerName ? orderData.customerName.substring(1) : '';

  const payload = {
    referenceId: orderData.orderId,
    language: orderData.language || 'zh-TW',
    amount: {
      value: Math.round(orderData.amount * 100),
      currency: 'TWD'
    },
    expireTime: orderData.expireTime || 60,
    returnUrl: orderData.returnUrl,
    mode: 'regular',
    allowPaymentMethodList: orderData.paymentMethods || ['CreditCard', 'LinePay'],
    paymentMethodOptions: buildPaymentMethodOptions(orderData),
    order: {
      products: orderData.products || [{
        id: orderData.orderId,
        name: orderData.productName || '訂單商品',
        quantity: 1,
        amount: {
          value: Math.round(orderData.amount * 100),
          currency: 'TWD'
        }
      }]
    },
    customer: {
      referenceCustomerId: orderData.customerId || '',
      personalInfo: {
        firstName: customerFirstName,
        lastName: customerLastName, // 官方 API 必填
        email: orderData.customerEmail,
        phone: orderData.customerPhone
      }
    },
    billing: {
      personalInfo: {
        firstName: customerFirstName,
        lastName: customerLastName, // 官方 API 必填
        email: orderData.customerEmail,
        phone: orderData.customerPhone
      }
    },
    client: {
      ip: orderData.clientIp || '127.0.0.1'
    }
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'merchantId': getConfig('SHOPLINE_MERCHANT_ID'),
      'apiKey': getConfig('SHOPLINE_API_KEY'),
      'requestId': requestId
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const responseCode = response.getResponseCode();
  const responseBody = JSON.parse(response.getContentText());

  if (responseCode !== 200) {
    throw new Error(`SHOPLINE Error [${responseBody.code}]: ${responseBody.msg}`);
  }

  return responseBody;
}

/**
 * 建構付款方式選項
 * 注意：ApplePay 與 LinePay 不支援 paymentMethodOptions
 */
function buildPaymentMethodOptions(orderData) {
  const options = {};
  const methods = orderData.paymentMethods || ['CreditCard', 'LinePay'];

  // 信用卡分期設定
  if (methods.includes('CreditCard')) {
    options.CreditCard = {
      installmentCounts: orderData.installments || ['0']
    };
  }

  // ATM 虛擬帳號期限
  if (methods.includes('VirtualAccount')) {
    options.VirtualAccount = {
      paymentExpireTime: orderData.atmExpireTime || 4320 // 官方預設 3 天
    };
  }

  // 街口支付期限
  if (methods.includes('JKOPay')) {
    options.JKOPay = {
      paymentExpireTime: orderData.jkoExpireTime || 60 // 官方預設 60 分鐘
    };
  }

  // 中租 BNPL 設定
  if (methods.includes('ChaileaseBNPL')) {
    options.ChaileaseBNPL = {
      installmentCounts: orderData.bnplInstallments || ['3', '6', '12'],
      paymentExpireTime: orderData.bnplExpireTime || 4320
    };
  }

  // 注意：ApplePay 和 LinePay 不支援 paymentMethodOptions，不需設定

  return options;
}

// ============= 查詢交易 =============

/**
 * 查詢結帳交易
 * @param {string} sessionId - Session ID
 * @param {boolean} isProduction - 是否為正式環境
 * @returns {Object} - 查詢結果
 */
function queryCheckoutSession(sessionId, isProduction = false) {
  const baseUrl = isProduction ? SHOPLINE_CONFIG.PRODUCTION_URL : SHOPLINE_CONFIG.SANDBOX_URL;
  const url = `${baseUrl}/api/v1/trade/sessions/query`;

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'merchantId': getConfig('SHOPLINE_MERCHANT_ID'),
      'apiKey': getConfig('SHOPLINE_API_KEY'),
      'requestId': Utilities.getUuid()
    },
    payload: JSON.stringify({ sessionId }),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  return JSON.parse(response.getContentText());
}

/**
 * 查詢付款交易
 * @param {string} tradeOrderId - 付款交易編號
 * @param {boolean} isProduction - 是否為正式環境
 * @returns {Object} - 查詢結果
 */
function queryPaymentTransaction(tradeOrderId, isProduction = false) {
  const baseUrl = isProduction ? SHOPLINE_CONFIG.PRODUCTION_URL : SHOPLINE_CONFIG.SANDBOX_URL;
  const url = `${baseUrl}/api/v1/trade/payment/get`;

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'merchantId': getConfig('SHOPLINE_MERCHANT_ID'),
      'apiKey': getConfig('SHOPLINE_API_KEY'),
      'requestId': Utilities.getUuid()
    },
    payload: JSON.stringify({ tradeOrderId }),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  return JSON.parse(response.getContentText());
}

// ============= 退款 =============

/**
 * 建立退款
 * @param {Object} refundData - 退款資料
 * @param {boolean} isProduction - 是否為正式環境
 * @returns {Object} - 退款結果
 */
function createRefund(refundData, isProduction = false) {
  const baseUrl = isProduction ? SHOPLINE_CONFIG.PRODUCTION_URL : SHOPLINE_CONFIG.SANDBOX_URL;
  const url = `${baseUrl}/api/v1/trade/refund/create`;

  const payload = {
    referenceOrderId: refundData.refundOrderId,
    tradeOrderId: refundData.tradeOrderId,
    amount: {
      value: Math.round(refundData.amount * 100),
      currency: 'TWD'
    },
    reason: refundData.reason || '顧客申請退款'
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'merchantId': getConfig('SHOPLINE_MERCHANT_ID'),
      'apiKey': getConfig('SHOPLINE_API_KEY'),
      'requestId': Utilities.getUuid()
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  return JSON.parse(response.getContentText());
}

// ============= Webhook 處理 =============

/**
 * 驗證 Webhook 簽章
 * @param {string} timestamp - 時間戳
 * @param {string} bodyString - 原始 body 字串
 * @param {string} receivedSign - 接收到的簽章
 * @returns {boolean} - 簽章是否有效
 */
function verifyWebhookSignature(timestamp, bodyString, receivedSign) {
  const signKey = getConfig('SHOPLINE_SIGN_KEY');
  const payload = timestamp + '.' + bodyString;

  const signature = Utilities.computeHmacSignature(
    Utilities.MacAlgorithm.HMAC_SHA_256,
    payload,
    signKey
  );

  const expectedSign = signature.map(function(b) {
    return ('0' + (b & 0xFF).toString(16)).slice(-2);
  }).join('');

  return expectedSign === receivedSign;
}

/**
 * Webhook 入口點 (doPost)
 * 部署為 Web App 後，設定此 URL 為 Webhook 接收端
 */
function doPost(e) {
  try {
    // 取得 Headers 和 Body
    const timestamp = e.headers ? (e.headers['timestamp'] || e.headers['Timestamp']) : '';
    const receivedSign = e.headers ? (e.headers['sign'] || e.headers['Sign']) : '';
    const bodyString = e.postData ? e.postData.contents : '';

    // 驗證簽章
    if (!verifyWebhookSignature(timestamp, bodyString, receivedSign)) {
      console.error('Webhook 簽章驗證失敗');
      return ContentService.createTextOutput('Invalid signature')
        .setMimeType(ContentService.MimeType.TEXT);
    }

    // 驗證時間戳（5 分鐘內）
    const now = Date.now();
    const webhookTime = parseInt(timestamp);
    if (Math.abs(now - webhookTime) > 5 * 60 * 1000) {
      console.error('Webhook 時間戳過期');
      return ContentService.createTextOutput('Timestamp expired')
        .setMimeType(ContentService.MimeType.TEXT);
    }

    // 解析事件
    const event = JSON.parse(bodyString);

    // 處理事件
    handleWebhookEvent(event);

    return ContentService.createTextOutput('OK')
      .setMimeType(ContentService.MimeType.TEXT);

  } catch (error) {
    console.error('Webhook 處理錯誤:', error);
    return ContentService.createTextOutput('Error')
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

/**
 * 處理 Webhook 事件
 * @param {Object} event - 事件資料
 */
function handleWebhookEvent(event) {
  const { id, type, created, data } = event;

  console.log('收到 Webhook 事件:', type);

  switch (type) {
    case 'trade.succeeded':
      handlePaymentSucceeded(data);
      break;

    case 'trade.failed':
      handlePaymentFailed(data);
      break;

    case 'trade.refund.succeeded':
      handleRefundSucceeded(data);
      break;

    default:
      console.log('未處理的事件類型:', type);
  }
}

/**
 * 處理付款成功事件
 */
function handlePaymentSucceeded(data) {
  const { referenceOrderId, tradeOrderId, payment } = data;

  console.log('付款成功:', referenceOrderId);

  // TODO: 更新 Google Sheet 中的訂單狀態
  // updateOrderInSheet(referenceOrderId, 'PAID', tradeOrderId);

  // TODO: 發送通知
  // sendPaymentNotification(referenceOrderId);
}

/**
 * 處理付款失敗事件
 */
function handlePaymentFailed(data) {
  const { referenceOrderId, paymentMsg } = data;

  console.log('付款失敗:', referenceOrderId, paymentMsg);

  // TODO: 記錄失敗
  // logPaymentFailure(referenceOrderId, paymentMsg);
}

/**
 * 處理退款成功事件
 */
function handleRefundSucceeded(data) {
  const { refundOrderId, referenceOrderId } = data;

  console.log('退款成功:', refundOrderId);

  // TODO: 更新訂單狀態為已退款
  // updateOrderInSheet(referenceOrderId, 'REFUNDED');
}

// ============= Google Sheet 整合範例 =============

/**
 * 更新 Sheet 中的訂單狀態
 * @param {string} orderId - 訂單編號
 * @param {string} status - 新狀態
 * @param {string} tradeOrderId - SLP 交易編號（可選）
 */
function updateOrderInSheet(orderId, status, tradeOrderId) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('訂單');
  const data = sheet.getDataRange().getValues();

  // 假設第一欄是訂單編號
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === orderId) {
      // 假設狀態在第 5 欄，交易編號在第 6 欄
      sheet.getRange(i + 1, 5).setValue(status);
      sheet.getRange(i + 1, 6).setValue(new Date());
      if (tradeOrderId) {
        sheet.getRange(i + 1, 7).setValue(tradeOrderId);
      }
      break;
    }
  }
}

// ============= 測試函式 =============

/**
 * 測試建立結帳交易
 */
function testCreateCheckout() {
  try {
    const result = createCheckoutSession({
      orderId: 'TEST-' + Date.now(),
      amount: 100,
      returnUrl: 'https://your-domain.com/return',
      paymentMethods: ['CreditCard', 'LinePay'],
      customerName: '測試用戶',
      customerEmail: 'test@example.com',
      customerPhone: '+886912345678'
    }, false); // false = 沙盒環境

    console.log('建立成功！');
    console.log('Session URL:', result.sessionUrl);

  } catch (error) {
    console.error('錯誤:', error.message);
  }
}

/**
 * 測試查詢交易
 */
function testQuerySession() {
  const sessionId = 'se_xxxxx'; // 替換為實際的 Session ID
  const result = queryCheckoutSession(sessionId, false);
  console.log('查詢結果:', JSON.stringify(result, null, 2));
}
