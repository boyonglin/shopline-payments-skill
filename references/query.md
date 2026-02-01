# 查詢交易 (Query)

用於查詢結帳交易和付款交易的狀態。

## 查詢結帳交易

### API Endpoint

```
POST {DOMAIN}/api/v1/trade/sessions/query
```

| 環境 | URL |
|------|-----|
| 沙盒 | `https://api-sandbox.shoplinepayments.com/api/v1/trade/sessions/query` |
| 正式 | `https://api.shoplinepayments.com/api/v1/trade/sessions/query` |

### 請求電文

```json
{
  "sessionId": "se_01022502286885089464780754095"
}
```

### 成功回應

```json
{
  "sessionId": "se_01022502286885089464780754095",
  "referenceId": "ORDER-2026013001",
  "status": "SUCCEEDED",
  "amount": {
    "value": 100000,
    "currency": "TWD"
  },
  "sessionUrl": "https://api-sandbox.shoplinepayments.com/checkout/session?sessionToken=xxxx",
  "createTime": "1740711420842",
  "paymentDetails": [
    {
      "tradeOrderId": "10010102714941391738628956160",
      "status": "SUCCEEDED"
    }
  ]
}
```

### Session 狀態

| 狀態 | 說明 |
|-----|------|
| `CREATED` | 已建立，等待付款 |
| `PENDING` | 處理中 |
| `SUCCEEDED` | 付款成功 |
| `EXPIRED` | 已過期 |

---

## 付款交易查詢

### API Endpoint

```
POST {DOMAIN}/api/v1/trade/payment/get
```

| 環境 | URL |
|------|-----|
| 沙盒 | `https://api-sandbox.shoplinepayments.com/api/v1/trade/payment/get` |
| 正式 | `https://api.shoplinepayments.com/api/v1/trade/payment/get` |

### 請求電文

```json
{
  "tradeOrderId": "10010061012921418117718876160"
}
```

### 成功回應

```json
{
  "tradeOrderId": "10010061012921418117718876160",
  "referenceOrderId": "ORDER-2026013001",
  "channelDealId": "CHANNEL_123",
  "status": "SUCCEEDED",
  "subStatus": "CAPTURED",
  "amount": {
    "value": 100000,
    "currency": "TWD"
  },
  "paidAmount": {
    "value": 100000,
    "currency": "TWD"
  },
  "lastPayment": {
    "brand": "Visa",
    "last4": "1234",
    "paymentMethod": "CreditCard",
    "paymentInstrument": {
      "paymentInstrumentId": "6456462132132",
      "savePaymentInstrument": true
    }
  },
  "nextAction": null
}
```

---

## 程式碼範例

### Node.js

```javascript
async function queryCheckoutSession(sessionId) {
  const url = 'https://api-sandbox.shoplinepayments.com/api/v1/trade/sessions/query';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'merchantId': process.env.SHOPLINE_MERCHANT_ID,
      'apiKey': process.env.SHOPLINE_API_KEY,
      'requestId': Date.now().toString()
    },
    body: JSON.stringify({ sessionId })
  });

  return await response.json();
}

async function queryPaymentTransaction(tradeOrderId) {
  const url = 'https://api-sandbox.shoplinepayments.com/api/v1/trade/payment/get';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'merchantId': process.env.SHOPLINE_MERCHANT_ID,
      'apiKey': process.env.SHOPLINE_API_KEY,
      'requestId': Date.now().toString()
    },
    body: JSON.stringify({ tradeOrderId })
  });

  return await response.json();
}

module.exports = { queryCheckoutSession, queryPaymentTransaction };
```

### PHP

```php
<?php
function queryCheckoutSession($sessionId) {
    $url = 'https://api-sandbox.shoplinepayments.com/api/v1/trade/sessions/query';

    $headers = [
        "Content-Type: application/json",
        "merchantId: " . getenv('SHOPLINE_MERCHANT_ID'),
        "apiKey: " . getenv('SHOPLINE_API_KEY'),
        "requestId: " . uniqid()
    ];

    $curl = curl_init();
    curl_setopt_array($curl, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode(['sessionId' => $sessionId]),
        CURLOPT_HTTPHEADER => $headers
    ]);

    $response = curl_exec($curl);
    curl_close($curl);

    return json_decode($response, true);
}

function queryPaymentTransaction($tradeOrderId) {
    $url = 'https://api-sandbox.shoplinepayments.com/api/v1/trade/payment/get';

    $headers = [
        "Content-Type: application/json",
        "merchantId: " . getenv('SHOPLINE_MERCHANT_ID'),
        "apiKey: " . getenv('SHOPLINE_API_KEY'),
        "requestId: " . uniqid()
    ];

    $curl = curl_init();
    curl_setopt_array($curl, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode(['tradeOrderId' => $tradeOrderId]),
        CURLOPT_HTTPHEADER => $headers
    ]);

    $response = curl_exec($curl);
    curl_close($curl);

    return json_decode($response, true);
}
```

## 使用時機

1. **付款完成後確認** - 顧客從 returnUrl 返回時，查詢確認付款狀態
2. **Webhook 補充驗證** - 收到 Webhook 通知後，主動查詢確認
3. **訂單狀態同步** - 定期同步訂單付款狀態
4. **客服查詢** - 客服人員查詢交易詳情
