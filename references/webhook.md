# Webhook 通知

SHOPLINE Payments 透過 Webhook 將交易事件推送到特店指定的 URL。

## Webhook 設定

### 沙盒環境設定

1. 確認需要訂閱的通知事件清單
2. 選擇沙盒環境對接帳號
3. 確認接收 Webhook 通知的 URL
4. 將資訊發送給 SHOPLINE Payments 串接窗口申請開通

### 正式環境設定

1. 確認需要訂閱的通知事件清單
2. 確認正式環境對接帳號
3. 確認接收 Webhook 通知的 URL
4. 發送郵件到 SHOPLINE Payments 串接窗口申請開通

---

## 事件類型

### 結帳交易事件

| 事件 | 說明 |
|-----|------|
| `session.created` | 結帳交易已建立 |
| `session.pending` | 結帳交易處理中 |
| `session.succeeded` | 結帳交易成功 |
| `session.expired` | 結帳交易已過期 |

### 付款交易事件

| 事件 | 說明 |
|-----|------|
| `trade.succeeded` | 付款成功 |
| `trade.failed` | 付款失敗 |
| `trade.expired` | 付款逾時 |
| `trade.processing` | 付款處理中 |
| `trade.cancelled` | 取消付款 |
| `trade.customer_action` | 等待顧客付款確認 |

### 退款事件

| 事件 | 說明 |
|-----|------|
| `trade.refund.succeeded` | 退款成功 |
| `trade.refund.failed` | 退款失敗 |

### 會員事件（內嵌式）

| 事件 | 說明 |
|-----|------|
| `customer.created` | 會員建立 |
| `customer.updated` | 會員更新 |
| `customer.deleted` | 會員註銷 |

### 付款工具事件（內嵌式）

| 事件 | 說明 |
|-----|------|
| `customer.instrument.binded` | 會員綁定付款工具 |
| `customer.instrument.updated` | 會員更新付款工具 |
| `customer.instrument.unbinded` | 會員解綁付款工具 |

---

## 通知格式

### HTTP Header

| 參數 | 必填 | 說明 |
|-----|------|------|
| `apiVersion` | 是 | API 版本編號，如 `V1.2` |
| `timestamp` | 是 | 發送通知的時間戳（毫秒） |
| `sign` | 是 | 簽章值 |

### HTTP Body

```json
{
  "id": "000100698482394232932302030234328327",
  "type": "trade.succeeded",
  "created": 1718551769058,
  "data": {
    // 事件資料
  }
}
```

| 參數 | 說明 |
|-----|------|
| `id` | 通知訊息唯一 ID |
| `type` | 事件類型 |
| `created` | 通知產生時間（時間戳） |
| `data` | 事件資料（依類型不同） |

---

## 付款成功事件範例

```json
{
  "id": "000100698482394232932302030234328327",
  "type": "trade.succeeded",
  "created": 1718551769058,
  "data": {
    "actionType": "SDK",
    "referenceOrderId": "ORDER-2026013001",
    "tradeOrderId": "1001001084733463323223973",
    "paymentMsg": null,
    "payment": {
      "paymentSuccessTime": "1718551768922",
      "autoCapture": true,
      "paymentBehavior": "Regular",
      "channelDealId": "17185517455610128070000",
      "paymentMethod": "CreditCard",
      "paymentMethodOptions": {
        "installments": {
          "installPay": null,
          "count": null,
          "installDownPay": null
        }
      },
      "creditCard": {
        "issuerCountry": "TW",
        "last4": "1234",
        "bin": "12345678",
        "type": "CREDIT",
        "category": "BUSINESS SIGNATURE",
        "brand": "Visa",
        "issuer": "HONG KONG AND SHANGHAI BANKING CORP., LTD."
      },
      "paidAmount": {
        "currency": "TWD",
        "value": 10000
      }
    },
    "nextAction": null,
    "additionalData": null,
    "subStatus": "",
    "status": "SUCCEEDED",
    "order": {
      "amount": {
        "currency": "TWD",
        "value": 10000
      },
      "referenceOrderId": "ORDER-2026013001",
      "merchantId": "12345678",
      "createTime": 1718551768994,
      "customer": {
        "customerId": "",
        "referenceCustomerId": "CUST-001"
      }
    }
  }
}
```

---

## 簽章驗證

SHOPLINE Payments 使用 HMAC-SHA256 產生簽章，用於驗證 Webhook 來源。

### 驗證步驟

1. **從 Header 提取參數**
   - `timestamp`：時間戳
   - `sign`：簽章值

2. **組合 payload 字串**
   ```
   payload = {timestamp}.{bodyString}
   ```

3. **計算預期簽章**
   ```
   expectedSign = HMAC-SHA256(payload, signKey)
   ```

4. **比對簽章**
   - 比對 `sign` 與 `expectedSign`
   - 檢查時間戳是否在容許範圍內

### Node.js 範例

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(timestamp, bodyString, receivedSign, signKey) {
  // Step 1: 組合 payload
  const payload = `${timestamp}.${bodyString}`;

  // Step 2: 計算 HMAC-SHA256
  const expectedSign = crypto
    .createHmac('sha256', signKey)
    .update(payload, 'utf8')
    .digest('hex');

  // Step 3: 比對簽章
  return expectedSign === receivedSign;
}

// Express.js 範例
app.post('/webhook/shopline', express.raw({ type: 'application/json' }), (req, res) => {
  const timestamp = req.headers['timestamp'];
  const receivedSign = req.headers['sign'];
  const bodyString = req.body.toString();

  // 驗證簽章
  if (!verifyWebhookSignature(timestamp, bodyString, receivedSign, process.env.SHOPLINE_SIGN_KEY)) {
    console.error('Invalid webhook signature');
    return res.status(401).send('Invalid signature');
  }

  // 驗證時間戳（防止重放攻擊）
  const now = Date.now();
  const webhookTime = parseInt(timestamp);
  if (Math.abs(now - webhookTime) > 5 * 60 * 1000) { // 5 分鐘容許
    console.error('Webhook timestamp expired');
    return res.status(401).send('Timestamp expired');
  }

  // 處理事件
  const { type, data } = JSON.parse(bodyString);

  switch (type) {
    case 'trade.succeeded':
      handlePaymentSuccess(data);
      break;
    case 'trade.failed':
      handlePaymentFailed(data);
      break;
    case 'trade.refund.succeeded':
      handleRefundSuccess(data);
      break;
    default:
      console.log(`Unhandled event type: ${type}`);
  }

  res.status(200).send('OK');
});

function handlePaymentSuccess(data) {
  const { tradeOrderId, referenceOrderId, payment } = data;
  console.log(`Payment succeeded: ${referenceOrderId}`);
  // 更新訂單狀態為已付款
}

function handlePaymentFailed(data) {
  const { tradeOrderId, referenceOrderId, paymentMsg } = data;
  console.log(`Payment failed: ${referenceOrderId}`, paymentMsg);
  // 記錄錯誤，通知顧客
}

function handleRefundSuccess(data) {
  const { refundOrderId, tradeOrderId } = data;
  console.log(`Refund succeeded: ${refundOrderId}`);
  // 更新訂單狀態為已退款
}
```

### PHP 範例

```php
<?php
function verifyWebhookSignature($timestamp, $bodyString, $receivedSign, $signKey) {
    $payload = $timestamp . '.' . $bodyString;
    $expectedSign = hash_hmac('sha256', $payload, $signKey);
    return hash_equals($expectedSign, $receivedSign);
}

// 接收 Webhook
$timestamp = $_SERVER['HTTP_TIMESTAMP'] ?? '';
$receivedSign = $_SERVER['HTTP_SIGN'] ?? '';
$bodyString = file_get_contents('php://input');

$signKey = getenv('SHOPLINE_SIGN_KEY');

// 驗證簽章
if (!verifyWebhookSignature($timestamp, $bodyString, $receivedSign, $signKey)) {
    http_response_code(401);
    echo 'Invalid signature';
    exit;
}

// 驗證時間戳
$now = round(microtime(true) * 1000);
$webhookTime = (int)$timestamp;
if (abs($now - $webhookTime) > 5 * 60 * 1000) {
    http_response_code(401);
    echo 'Timestamp expired';
    exit;
}

// 處理事件
$data = json_decode($bodyString, true);
$type = $data['type'];
$eventData = $data['data'];

switch ($type) {
    case 'trade.succeeded':
        // 更新訂單為已付款
        break;
    case 'trade.failed':
        // 記錄失敗
        break;
    case 'trade.refund.succeeded':
        // 更新為已退款
        break;
}

http_response_code(200);
echo 'OK';
```

### Google Apps Script 範例

```javascript
function doPost(e) {
  const timestamp = e.headers['timestamp'];
  const receivedSign = e.headers['sign'];
  const bodyString = e.postData.contents;
  const signKey = PropertiesService.getScriptProperties().getProperty('SHOPLINE_SIGN_KEY');

  // 驗證簽章
  const payload = timestamp + '.' + bodyString;
  const signature = Utilities.computeHmacSignature(
    Utilities.MacAlgorithm.HMAC_SHA_256,
    payload,
    signKey
  );
  const expectedSign = signature.map(b =>
    ('0' + (b & 0xFF).toString(16)).slice(-2)
  ).join('');

  if (expectedSign !== receivedSign) {
    return ContentService.createTextOutput('Invalid signature')
      .setMimeType(ContentService.MimeType.TEXT);
  }

  // 處理事件
  const data = JSON.parse(bodyString);

  switch (data.type) {
    case 'trade.succeeded':
      updateOrderStatus(data.data.referenceOrderId, 'PAID');
      break;
    case 'trade.refund.succeeded':
      updateOrderStatus(data.data.referenceOrderId, 'REFUNDED');
      break;
  }

  return ContentService.createTextOutput('OK')
    .setMimeType(ContentService.MimeType.TEXT);
}
```

---

## 重要注意事項

1. **回應 200**：收到 Webhook 後務必回應 HTTP 200，否則 SHOPLINE 會重試
2. **冪等處理**：同一事件可能重複推送，需做冪等處理
3. **非同步處理**：建議先回應 200，再非同步處理業務邏輯
4. **簽章驗證**：務必驗證簽章，確保來源合法
5. **時間戳驗證**：檢查時間戳防止重放攻擊
6. **HTTPS 必須**：Webhook URL 必須使用 HTTPS
