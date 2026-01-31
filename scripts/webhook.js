/**
 * SHOPLINE Payments - Webhook Handler
 * Node.js Webhook 驗證與處理範例
 */

const crypto = require('crypto');

// 環境設定
const SIGN_KEY = process.env.SHOPLINE_SIGN_KEY;
const TIMESTAMP_TOLERANCE = 5 * 60 * 1000; // 5 分鐘容許

/**
 * 驗證 Webhook 簽章
 * @param {string} timestamp - Header 中的 timestamp
 * @param {string} bodyString - 原始請求 body 字串
 * @param {string} receivedSign - Header 中的 sign
 * @param {string} signKey - 簽章金鑰
 * @returns {boolean} - 簽章是否有效
 */
function verifySignature(timestamp, bodyString, receivedSign, signKey = SIGN_KEY) {
  // 組合 payload
  const payload = `${timestamp}.${bodyString}`;

  // 計算 HMAC-SHA256
  const expectedSign = crypto
    .createHmac('sha256', signKey)
    .update(payload, 'utf8')
    .digest('hex');

  // 時間安全比對
  return crypto.timingSafeEqual(
    Buffer.from(expectedSign),
    Buffer.from(receivedSign)
  );
}

/**
 * 驗證時間戳（防止重放攻擊）
 * @param {string} timestamp - 時間戳字串
 * @param {number} tolerance - 容許誤差（毫秒）
 * @returns {boolean} - 時間戳是否在有效範圍內
 */
function verifyTimestamp(timestamp, tolerance = TIMESTAMP_TOLERANCE) {
  const now = Date.now();
  const webhookTime = parseInt(timestamp, 10);
  return Math.abs(now - webhookTime) <= tolerance;
}

/**
 * 完整的 Webhook 驗證
 * @param {Object} headers - 請求 headers
 * @param {string} bodyString - 原始請求 body
 * @returns {Object} - 驗證結果
 */
function validateWebhook(headers, bodyString) {
  const timestamp = headers['timestamp'] || headers['Timestamp'];
  const receivedSign = headers['sign'] || headers['Sign'];

  if (!timestamp || !receivedSign) {
    return { valid: false, error: 'Missing timestamp or sign header' };
  }

  if (!verifyTimestamp(timestamp)) {
    return { valid: false, error: 'Timestamp expired' };
  }

  if (!verifySignature(timestamp, bodyString, receivedSign)) {
    return { valid: false, error: 'Invalid signature' };
  }

  return { valid: true };
}

/**
 * 處理 Webhook 事件
 * @param {Object} event - Webhook 事件資料
 */
async function handleWebhookEvent(event) {
  const { id, type, created, data } = event;

  console.log(`[Webhook] 收到事件: ${type} (ID: ${id})`);

  switch (type) {
    case 'session.created':
      await handleSessionCreated(data);
      break;

    case 'session.succeeded':
      await handleSessionSucceeded(data);
      break;

    case 'session.expired':
      await handleSessionExpired(data);
      break;

    case 'trade.succeeded':
      await handlePaymentSucceeded(data);
      break;

    case 'trade.failed':
      await handlePaymentFailed(data);
      break;

    case 'trade.expired':
      await handlePaymentExpired(data);
      break;

    case 'trade.cancelled':
      await handlePaymentCancelled(data);
      break;

    case 'trade.refund.succeeded':
      await handleRefundSucceeded(data);
      break;

    case 'trade.refund.failed':
      await handleRefundFailed(data);
      break;

    default:
      console.log(`[Webhook] 未處理的事件類型: ${type}`);
  }
}

// ============= 事件處理函式 =============

async function handleSessionCreated(data) {
  console.log('[Session] 結帳交易已建立:', data.sessionId);
}

async function handleSessionSucceeded(data) {
  console.log('[Session] 結帳交易成功:', data.sessionId);
  // 更新訂單狀態
}

async function handleSessionExpired(data) {
  console.log('[Session] 結帳交易已過期:', data.sessionId);
  // 標記訂單為過期
}

async function handlePaymentSucceeded(data) {
  const { tradeOrderId, referenceOrderId, payment } = data;

  console.log('[Payment] 付款成功');
  console.log('  訂單編號:', referenceOrderId);
  console.log('  交易編號:', tradeOrderId);
  console.log('  付款方式:', payment?.paymentMethod);
  console.log('  金額:', payment?.paidAmount?.value / 100, '元');

  // TODO: 更新訂單狀態為已付款
  // await updateOrderStatus(referenceOrderId, 'PAID');

  // TODO: 發送確認郵件
  // await sendConfirmationEmail(referenceOrderId);
}

async function handlePaymentFailed(data) {
  const { tradeOrderId, referenceOrderId, paymentMsg } = data;

  console.log('[Payment] 付款失敗');
  console.log('  訂單編號:', referenceOrderId);
  console.log('  錯誤訊息:', paymentMsg);

  // TODO: 記錄失敗原因
  // await logPaymentFailure(referenceOrderId, paymentMsg);
}

async function handlePaymentExpired(data) {
  const { tradeOrderId, referenceOrderId } = data;

  console.log('[Payment] 付款逾時:', referenceOrderId);

  // TODO: 標記訂單為逾時
  // await updateOrderStatus(referenceOrderId, 'EXPIRED');
}

async function handlePaymentCancelled(data) {
  const { tradeOrderId, referenceOrderId } = data;

  console.log('[Payment] 付款已取消:', referenceOrderId);

  // TODO: 標記訂單為已取消
  // await updateOrderStatus(referenceOrderId, 'CANCELLED');
}

async function handleRefundSucceeded(data) {
  const { refundOrderId, tradeOrderId, referenceOrderId } = data;

  console.log('[Refund] 退款成功');
  console.log('  退款編號:', refundOrderId);
  console.log('  原訂單:', referenceOrderId);

  // TODO: 更新訂單狀態為已退款
  // await updateOrderStatus(referenceOrderId, 'REFUNDED');
}

async function handleRefundFailed(data) {
  const { refundOrderId, tradeOrderId, reason } = data;

  console.log('[Refund] 退款失敗');
  console.log('  退款編號:', refundOrderId);
  console.log('  原因:', reason);

  // TODO: 通知處理退款失敗
  // await notifyRefundFailure(refundOrderId, reason);
}

// ============= Express.js 中介軟體 =============

/**
 * Express.js Webhook 中介軟體
 * 使用方式：
 * app.post('/webhook/shopline', express.raw({ type: 'application/json' }), shoplineWebhookMiddleware);
 */
function createExpressMiddleware(signKey) {
  return async (req, res) => {
    try {
      const bodyString = req.body.toString();
      const validation = validateWebhook(req.headers, bodyString);

      if (!validation.valid) {
        console.error('[Webhook] 驗證失敗:', validation.error);
        return res.status(401).json({ error: validation.error });
      }

      // 先回應 200，避免逾時
      res.status(200).send('OK');

      // 非同步處理事件
      const event = JSON.parse(bodyString);
      await handleWebhookEvent(event);

    } catch (error) {
      console.error('[Webhook] 處理錯誤:', error);
      // 已經回應過了，不需要再回應
    }
  };
}

// ============= 完整 Express 範例 =============

/*
const express = require('express');
const app = express();

// Webhook endpoint - 使用 raw body
app.post('/webhook/shopline',
  express.raw({ type: 'application/json' }),
  createExpressMiddleware(process.env.SHOPLINE_SIGN_KEY)
);

// 其他 routes 使用 JSON parser
app.use(express.json());

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
*/

module.exports = {
  verifySignature,
  verifyTimestamp,
  validateWebhook,
  handleWebhookEvent,
  createExpressMiddleware
};
