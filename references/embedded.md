# 內嵌式串接指南 (Embedded Integration)

內嵌式串接方式透過 SDK + API 提供金流服務給特店，讓特店在其結帳頁內嵌金流 SDK，顧客可以直接在結帳頁進行付款，無需跳轉。

## 適用場景

內嵌式串接適合以下特店：
- 需要完整控制結帳流程體驗
- 需要綁卡/快捷/定期交易等進階功能
- 關注全流程的用戶體驗

## 支援的付款方式

| 付款方式 | paymentMethod 值 | 說明 |
|---------|-----------------|------|
| 信用卡 | `CreditCard` | 一般信用卡付款 |
| 信用卡分期 | `CreditCard` | 透過 installment 參數設定 |
| ATM 銀行轉帳 | `VirtualAccount` | 產生虛擬帳號 |
| 街口支付 | `JKOPay` | 跳轉街口 APP |
| Apple Pay | `ApplePay` | 需 Safari 且裝置支援 |
| LINE Pay | `LinePay` | 跳轉 LINE Pay |
| 中租銀角零卡 | `ChaileaseBNPL` | BNPL 先買後付 |

## 系統互動流程

```
1. 顧客在特店購物結帳，提交給特店 Server 處理
2. 特店 Server 回覆 SDK 所需資訊（金額、訂單資訊等）
3. 特店前端請求 SDK 初始化
4. SDK 呈現收銀台介面
5. 顧客填寫付款資訊（信用卡卡號、CVV 等）
6. 顧客點擊結帳，SDK 建立 paySession
7. 特店 Server 呼叫「建立付款交易」API
8. SDK 發起付款（可能需 3D 驗證）
9. 付款完成後跳轉 returnUrl
10. 特店透過 Webhook 接收付款結果
```

## 技術串接

### 1. 引入 JS SDK

#### NPM 安裝

```bash
npm install @shoplinepayments/payment-web
```

```javascript
import ShoplinePayments from '@shoplinepayments/payment-web'
```

#### CDN 引入

```html
<script src="https://cdn.shoplinepayments.com/sdk/v1/payment-web.js"></script>
```

使用 `window.ShoplinePayments` 存取 SDK。

### 2. 準備容器

在 HTML 中建立空白容器：

```html
<div id="paymentContainer"></div>
```

### 3. 初始化 SDK

```javascript
const { payment, error } = await ShoplinePayments({
  // 必填參數
  clientKey: 'YOUR_CLIENT_KEY',
  merchantId: 'YOUR_MERCHANT_ID',
  paymentMethod: 'CreditCard',
  currency: 'TWD',
  amount: 10000, // 100 元 = 10000（金額 × 100）
  element: '#paymentContainer',

  // 選填參數
  env: 'sandbox', // 'sandbox' 或 'production'
  language: 'zh-TW', // 顯示語言
  countryCode: 'TW',

  // 平台特店必填
  // platformId: 'YOUR_PLATFORM_ID'
})

// 檢查初始化錯誤
if (error) {
  const { message, code } = error
  console.error('SDK 初始化失敗:', code, message)
  return
}
```

### 初始化參數說明

| 參數 | 類型 | 必填 | 說明 |
|-----|------|-----|------|
| `clientKey` | String | 是 | SDK 串接認證金鑰 |
| `merchantId` | String | 是 | SLP 特店 ID |
| `paymentMethod` | String | 是 | 付款方式 |
| `currency` | String | 是 | 幣種，目前僅支援 `TWD` |
| `amount` | Number | 是 | 付款金額（實際金額 × 100） |
| `element` | String | 是 | 容器 selector |
| `env` | String | 否 | 環境，預設 `production` |

> **備註**：更多初始化參數請參考官方文件：https://docs.shoplinepayments.com/sdk/initData/

### 4. 建立 paySession

當顧客點擊結帳按鈕時：

```javascript
// 取得 paySession
const { paySession, error } = await payment.createPayment()

if (error) {
  const { message, code } = error
  console.error('建立 paySession 失敗:', code, message)
  return
}

// 將 paySession 傳送到後端
const { nextAction } = await createPaymentOrder(paySession)
```

> **重要**：`createPayment()` 必須在顧客點擊事件後呼叫，否則 ApplePay 可能會失敗。

### 5. 建立付款交易 (Server API)

**API Endpoint**

```
POST https://api-sandbox.shoplinepayments.com/api/v1/trade/payment/create
```

**Request Headers**

```
Content-Type: application/json
merchantId: YOUR_MERCHANT_ID
apiKey: YOUR_API_KEY
requestId: UNIQUE_REQUEST_ID
```

**Request Body**

```javascript
{
  "acquirerType": "SDK",  // 固定填 SDK
  "referenceOrderId": "ORDER_12345",
  "language": "zh-TW",
  "amount": {
    "value": 10000,  // 100 元
    "currency": "TWD"
  },
  "returnUrl": "https://your-domain.com/return",
  "paySession": "{...}", // 從 SDK 取得的 paySession
  "confirm": {
    "paymentMethod": "CreditCard",
    "paymentBehavior": "Regular"
  },
  "client": {
    "ip": "顧客 IP"
  },
  "order": {
    "products": [{
      "id": "PRODUCT_001",
      "name": "商品名稱",
      "quantity": 1,
      "amount": { "value": 10000, "currency": "TWD" }
    }]
  },
  "customer": {
    "personalInfo": {
      "firstName": "名",
      "lastName": "姓",
      "email": "customer@email.com",
      "phone": "+886912345678"
    }
  }
}
```

**Response**

```javascript
{
  "tradeOrderId": "10010061012921418117718876160",
  "status": "PROCESSING",
  "nextAction": {
    "type": "Redirect",
    "url": "https://..."
  }
}
```

### 6. 發起付款

```javascript
const payResult = await payment.pay(nextAction)

// 付款成功時 payResult 為 undefined
if (payResult && payResult.error) {
  const { message, code } = payResult.error
  console.error('付款失敗:', code, message)
}
```

發起 `pay()` 後可能出現三種情況：

1. **正常完成**：跳轉到 `returnUrl`
2. **需要 3D 驗證**：跳轉到 3D 驗證頁面，完成後跳轉 `returnUrl`
3. **錯誤回應**：銀行端拒絕交易

## SDK 其他 API

### 更新金額或語言

```javascript
const updateResult = await payment.update({
  language: 'en',
  amount: 300000  // 3000 元
})

if (updateResult && updateResult.error) {
  console.error('更新失敗:', updateResult.error)
}
```

### 銷毀實例

```javascript
payment.destroy()
```

## 完整程式碼範例

### 前端 (JavaScript)

```javascript
// 初始化 SDK
async function initPaymentSDK(amount) {
  const { payment, error } = await ShoplinePayments({
    clientKey: 'YOUR_CLIENT_KEY',
    merchantId: 'YOUR_MERCHANT_ID',
    paymentMethod: 'CreditCard',
    currency: 'TWD',
    amount: amount * 100,
    element: '#paymentContainer',
    env: 'sandbox'
  })

  if (error) {
    throw new Error(error.message)
  }

  return payment
}

// 處理結帳
async function handleCheckout(payment, orderData) {
  // 1. 建立 paySession
  const { paySession, error: sessionError } = await payment.createPayment()
  if (sessionError) {
    throw new Error(sessionError.message)
  }

  // 2. 呼叫後端 API 建立付款交易
  const response = await fetch('/api/create-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      paySession,
      orderId: orderData.orderId,
      amount: orderData.amount
    })
  })
  const { nextAction } = await response.json()

  // 3. 發起付款
  const payResult = await payment.pay(nextAction)
  if (payResult && payResult.error) {
    throw new Error(payResult.error.message)
  }
}
```

### 後端 (Node.js)

```javascript
const express = require('express')
const app = express()

app.post('/api/create-payment', async (req, res) => {
  const { paySession, orderId, amount } = req.body

  const response = await fetch(
    'https://api-sandbox.shoplinepayments.com/api/v1/trade/payment/create',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'merchantId': process.env.MERCHANT_ID,
        'apiKey': process.env.API_KEY,
        'requestId': `req_${Date.now()}`
      },
      body: JSON.stringify({
        acquirerType: 'SDK',
        referenceOrderId: orderId,
        language: 'zh-TW',
        amount: { value: amount * 100, currency: 'TWD' },
        returnUrl: 'https://your-domain.com/return',
        paySession,
        confirm: {
          paymentMethod: 'CreditCard',
          paymentBehavior: 'Regular'
        },
        client: { ip: req.ip }
      })
    }
  )

  const result = await response.json()
  res.json(result)
})
```

## 與導轉式的比較

| 項目 | 導轉式 | 內嵌式 |
|-----|-------|-------|
| 串接複雜度 | 簡單 | 中等 |
| 用戶體驗 | 跳轉付款頁 | 不跳轉（信用卡） |
| 綁卡功能 | 否 | 是 |
| 快捷付款 | 否 | 是 |
| 定期扣款 | 否 | 是 |
| 適合對象 | 快速整合 | 完整控制流程 |

## 相關文檔

- [SDK 初始化參數](https://docs.shoplinepayments.com/sdk/initData/)
- [SDK 錯誤碼](https://docs.shoplinepayments.com/appendix/sdkErrorCode/)
- [建立付款交易 API](https://docs.shoplinepayments.com/api/trade/create/)
- [付款交易查詢](https://docs.shoplinepayments.com/api/trade/query/)
- [一般付款串接](https://docs.shoplinepayments.com/guide/normal/)
- [綁卡/快捷/定期付款串接](https://docs.shoplinepayments.com/guide/quick/)
