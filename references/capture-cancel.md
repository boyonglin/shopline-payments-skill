# 交易請款與取消授權

信用卡交易的請款（Capture）與取消授權（Cancel）操作。

## 交易請款 (Capture)

對信用卡授權交易進行請款，扣除授權鎖定的金額。

### API Endpoint

```
POST {DOMAIN}/api/v1/trade/payment/capture
```

| 環境 | URL |
|------|-----|
| 沙盒 | `https://api-sandbox.shoplinepayments.com/api/v1/trade/payment/capture` |
| 正式 | `https://api.shoplinepayments.com/api/v1/trade/payment/capture` |

### 請求電文

```json
{
  "referenceOrderId": "ORDER-2026013001",
  "tradeOrderId": "10010061012921418117718876160",
  "amount": {
    "value": 100000,
    "currency": "TWD"
  },
  "additionalData": {}
}
```

### 參數說明

| 參數 | 類型 | 必填 | 說明 |
|-----|------|------|------|
| `referenceOrderId` | String(32) | 二擇一 | 特店訂單號 |
| `tradeOrderId` | String(32) | 二擇一 | SLP 付款交易訂單編號 |
| `amount.value` | Number | 是 | 請款金額（台幣 × 100） |
| `amount.currency` | String | 是 | 幣種，`TWD` |
| `additionalData` | Map | 選填 | 附加資訊 |

### 成功回應

```json
{
  "tradeOrderId": "10010061012921418117718876160",
  "status": "PROCESSING",
  "amount": {
    "value": 100000,
    "currency": "TWD"
  }
}
```

> **注意**：請款 API 回應的 `status` 通常為 `PROCESSING`，表示請求已接受但尚在處理中。最終結果需透過 Webhook 通知或主動查詢取得，切勿以同步回應的狀態作為最終結果。

### 請款狀態

| 狀態 | 說明 |
|-----|------|
| `PROCESSING` | 處理中 |
| `SUCCEEDED` | 請款成功 |
| `FAILED` | 請款失敗 |

### 請款錯誤碼

| 錯誤碼 | 說明 |
|-------|------|
| 7001 | 請款金額超過可請款金額 |
| 7002 | 交易狀態異常，無法請款 |
| 7400 | 交易狀態異常 |
| 7401 | 通路系統原因導致無法請款 |
| 7402 | 請款金額超過可請款金額 |
| 7403 | 因授權額度問題請款失敗 |

---

## 交易取消 (Cancel)

取消信用卡授權交易，釋放授權鎖定的金額額度。

> **重要**：只能在請款前取消授權，請款後只能進行退款。

### API Endpoint

```
POST {DOMAIN}/api/v1/trade/payment/cancel
```

| 環境 | URL |
|------|-----|
| 沙盒 | `https://api-sandbox.shoplinepayments.com/api/v1/trade/payment/cancel` |
| 正式 | `https://api.shoplinepayments.com/api/v1/trade/payment/cancel` |

### 請求電文

```json
{
  "referenceOrderId": "ORDER-2026013001",
  "tradeOrderId": "10010061012921418117718876160",
  "additionalData": {}
}
```

### 參數說明

| 參數 | 類型 | 必填 | 說明 |
|-----|------|------|------|
| `referenceOrderId` | String(32) | 是 | 特店訂單號 |
| `tradeOrderId` | String(48) | 是 | SLP 付款交易訂單編號 |
| `additionalData` | Map | 選填 | 附加資訊 |

### 成功回應

```json
{
  "tradeOrderId": "10010061012921418117718876160",
  "status": "PROCESSING"
}
```

> **注意**：取消授權 API 回應的 `status` 通常為 `PROCESSING`，表示請求已接受但尚在處理中。最終狀態（如 `CANCELLED`）需透過 Webhook 通知或主動查詢確認。

### 取消授權錯誤碼

| 錯誤碼 | 說明 |
|-------|------|
| 6001 | 交易處理中，無法取消 |
| 6002 | 交易已請款，無法取消（請使用退款） |
| 6003 | 交易已取消，無法再取消 |
| 6400 | 交易狀態異常，無法取消 |
| 6401 | 通路系統原因導致無法取消 |

---

## 程式碼範例

### Node.js

```javascript
// 請款
async function capturePayment(tradeOrderId, amount) {
  const url = 'https://api-sandbox.shoplinepayments.com/api/v1/trade/payment/capture';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'merchantId': process.env.SHOPLINE_MERCHANT_ID,
      'apiKey': process.env.SHOPLINE_API_KEY,
      'requestId': Date.now().toString()
    },
    body: JSON.stringify({
      tradeOrderId,
      amount: {
        value: amount * 100,
        currency: 'TWD'
      }
    })
  });

  return await response.json();
}

// 取消授權
async function cancelPayment(tradeOrderId, referenceOrderId) {
  const url = 'https://api-sandbox.shoplinepayments.com/api/v1/trade/payment/cancel';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'merchantId': process.env.SHOPLINE_MERCHANT_ID,
      'apiKey': process.env.SHOPLINE_API_KEY,
      'requestId': Date.now().toString()
    },
    body: JSON.stringify({
      tradeOrderId,
      referenceOrderId
    })
  });

  return await response.json();
}

module.exports = { capturePayment, cancelPayment };
```

### PHP

```php
<?php
// 請款
function capturePayment($tradeOrderId, $amount) {
    $url = 'https://api-sandbox.shoplinepayments.com/api/v1/trade/payment/capture';

    $headers = [
        "Content-Type: application/json",
        "merchantId: " . getenv('SHOPLINE_MERCHANT_ID'),
        "apiKey: " . getenv('SHOPLINE_API_KEY'),
        "requestId: " . uniqid()
    ];

    $data = [
        "tradeOrderId" => $tradeOrderId,
        "amount" => [
            "value" => $amount * 100,
            "currency" => "TWD"
        ]
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
    curl_close($curl);

    return json_decode($response, true);
}

// 取消授權
function cancelPayment($tradeOrderId, $referenceOrderId) {
    $url = 'https://api-sandbox.shoplinepayments.com/api/v1/trade/payment/cancel';

    $headers = [
        "Content-Type: application/json",
        "merchantId: " . getenv('SHOPLINE_MERCHANT_ID'),
        "apiKey: " . getenv('SHOPLINE_API_KEY'),
        "requestId: " . uniqid()
    ];

    $data = [
        "tradeOrderId" => $tradeOrderId,
        "referenceOrderId" => $referenceOrderId
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
    curl_close($curl);

    return json_decode($response, true);
}
```

---

## 交易狀態流程圖

```
┌─────────────┐
│   CREATED   │ 建立交易
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ PROCESSING  │ 處理中
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│ SUCCEEDED   │────▶│  AUTHORIZED │ 已授權（未請款）
│ (subStatus) │     └──────┬──────┘
└─────────────┘            │
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
       ┌───────────┐ ┌───────────┐ ┌───────────┐
       │  CANCEL   │ │  CAPTURE  │ │  EXPIRED  │
       │  取消授權  │ │   請款    │ │  授權過期  │
       └───────────┘ └─────┬─────┘ └───────────┘
                           │
                           ▼
                    ┌───────────┐
                    │ CAPTURED  │ 已請款
                    └─────┬─────┘
                          │
                          ▼
                    ┌───────────┐
                    │  REFUND   │ 退款
                    └───────────┘
```

## 使用場景

### 自動請款（預設）

大多數情況下，交易會自動請款，不需要手動操作。

### 手動請款

適用於以下場景：
- 需要先確認庫存再扣款
- 需要人工審核訂單
- 預購/訂製商品

### 取消授權

適用於：
- 訂單取消（請款前）
- 庫存不足無法出貨
- 顧客要求取消

## 注意事項

1. 授權有效期通常為 7-30 天（依發卡行而定）
2. 請款金額可以小於授權金額（部分請款）
3. 取消授權後，授權額度會立即釋放
4. 請款後若需退款，請使用退款 API（參考 [refund.md](refund.md)）
