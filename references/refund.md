# 建立退款交易 (Refund)

對已成功的交易進行退款（請款後方可退款）。

## API Endpoint

```
POST {DOMAIN}/api/v1/trade/refund/create
```

| 環境 | URL |
|------|-----|
| 沙盒 | `https://api-sandbox.shoplinepayments.com/api/v1/trade/refund/create` |
| 正式 | `https://api.shoplinepayments.com/api/v1/trade/refund/create` |

## HTTP Header 參數

| 參數 | 必填 | 說明 |
|-----|------|------|
| `Content-Type` | 是 | 固定值：`application/json` |
| `merchantId` | 是 | 特店 ID |
| `apiKey` | 是 | API 介面金鑰 |
| `requestId` | 是 | 請求流水號，每個請求唯一 |
| `platformId` | 選填 | 平台 ID（平台特店必填） |
| `idempotentKey` | 選填 | 冪等 KEY |

## 請求電文

```json
{
  "referenceOrderId": "REFUND-2026013001",
  "tradeOrderId": "10010061012921418117718876160",
  "amount": {
    "value": 100000,
    "currency": "TWD"
  },
  "reason": "顧客申請退款",
  "callbackUrl": "https://your-domain.com/webhook/refund",
  "additionalData": {
    "note": "訂單取消退款"
  }
}
```

### 參數說明

| 參數 | 類型 | 必填 | 說明 |
|-----|------|------|------|
| `referenceOrderId` | String(32) | 是 | 特店退款訂單號（唯一） |
| `tradeOrderId` | String(32) | 是 | SLP 付款交易訂單編號 |
| `amount.value` | Number | 是 | 退款金額（台幣 × 100） |
| `amount.currency` | String | 是 | 幣種，`TWD` |
| `reason` | String(256) | 選填 | 退款原因 |
| `callbackUrl` | String(256) | 選填 | Webhook callback URL |
| `additionalData` | Map | 選填 | 附加資訊 |

## 回應電文

### 成功回應 (HTTP 200)

```json
{
  "refundOrderId": "45668468546465",
  "referenceOrderId": "REFUND-2026013001",
  "tradeOrderId": "10010061012921418117718876160",
  "amount": {
    "value": 100000,
    "currency": "TWD"
  },
  "status": "SUCCEEDED"
}
```

### 回應參數說明

| 參數 | 說明 |
|-----|------|
| `refundOrderId` | SLP 退款訂單號 |
| `referenceOrderId` | 特店退款訂單號 |
| `tradeOrderId` | 原付款交易訂單編號 |
| `status` | 退款狀態 |

### 退款狀態

| 狀態 | 說明 |
|-----|------|
| `PROCESSING` | 處理中 |
| `SUCCEEDED` | 退款成功 |
| `FAILED` | 退款失敗 |

### 錯誤回應

```json
{
  "code": "1014",
  "msg": "The refund failed due to exceeded the allowable refund amount."
}
```

## 退款錯誤碼

完整錯誤碼請參考：

- https://docs.shoplinepayments.com/appendix/errorCode/

## 程式碼範例

### Node.js

```javascript
async function createRefund(refundData) {
  const url = 'https://api-sandbox.shoplinepayments.com/api/v1/trade/refund/create';

  const payload = {
    referenceOrderId: refundData.refundOrderId,
    tradeOrderId: refundData.tradeOrderId,
    amount: {
      value: refundData.amount * 100,
      currency: 'TWD'
    },
    reason: refundData.reason || '顧客申請退款',
    callbackUrl: refundData.callbackUrl
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'merchantId': process.env.SHOPLINE_MERCHANT_ID,
      'apiKey': process.env.SHOPLINE_API_KEY,
      'requestId': Date.now().toString()
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(`Refund Error: ${result.code} - ${result.msg}`);
  }

  return result;
}

module.exports = { createRefund };
```

### PHP

```php
<?php
function createRefund($refundData) {
    $url = 'https://api-sandbox.shoplinepayments.com/api/v1/trade/refund/create';

    $headers = [
        "Content-Type: application/json",
        "merchantId: " . getenv('SHOPLINE_MERCHANT_ID'),
        "apiKey: " . getenv('SHOPLINE_API_KEY'),
        "requestId: " . uniqid()
    ];

    $data = [
        "referenceOrderId" => $refundData['refundOrderId'],
        "tradeOrderId" => $refundData['tradeOrderId'],
        "amount" => [
            "value" => $refundData['amount'] * 100,
            "currency" => "TWD"
        ],
        "reason" => $refundData['reason'] ?? "顧客申請退款",
        "callbackUrl" => $refundData['callbackUrl'] ?? null
    ];

    $curl = curl_init();
    curl_setopt_array($curl, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($data),
        CURLOPT_HTTPHEADER => $headers
    ]);

    $response = curl_exec($curl);
    $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);

    return json_decode($response, true);
}
```

## 退款查詢

若需查詢退款狀態，可透過退款交易查詢 API 查看退款記錄：

```
POST {DOMAIN}/api/v1/trade/refund/get
```

| 環境 | URL |
|------|-----|
| 沙盒 | `https://api-sandbox.shoplinepayments.com/api/v1/trade/refund/get` |
| 正式 | `https://api.shoplinepayments.com/api/v1/trade/refund/get` |

```json
{
  "refundOrderId": "45668468546465"
}
```

## 注意事項

1. 退款成功後會觸發 `trade.refund.succeeded` Webhook 事件
2. 退款失敗會觸發 `trade.refund.failed` Webhook 事件
3. 建議使用 `referenceOrderId` 作為冪等控制，避免重複退款
4. 部分通路（如 ATM 虛擬帳號）可能不支援線上退款
