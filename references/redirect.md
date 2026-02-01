# 導轉式串接指南 (Redirect Integration)

導轉式串接的核心 API，用於建立結帳交易並取得付款頁面 URL。

## API Endpoint

```
POST {DOMAIN}/api/v1/trade/sessions/create
```

| 環境 | URL |
|------|-----|
| 沙盒 | `https://api-sandbox.shoplinepayments.com/api/v1/trade/sessions/create` |
| 正式 | `https://api.shoplinepayments.com/api/v1/trade/sessions/create` |

## HTTP Header 參數

| 參數 | 必填 | 說明 |
|-----|------|------|
| `Content-Type` | 是 | 固定值：`application/json` |
| `merchantId` | 是 | 特店 ID |
| `apiKey` | 是 | API 介面金鑰 |
| `requestId` | 是 | 請求流水號，每個請求唯一 |
| `platformId` | 選填 | 平台 ID（平台特店必填） |
| `idempotentKey` | 選填 | 冪等 KEY |

## 請求電文 (Request Body)

### 完整範例

```json
{
  "referenceId": "ORDER-2026013001",
  "language": "zh-TW",
  "amount": {
    "value": 100000,
    "currency": "TWD"
  },
  "expireTime": 60,
  "returnUrl": "https://your-domain.com/payment/return",
  "mode": "regular",
  "allowPaymentMethodList": ["CreditCard", "LinePay", "VirtualAccount", "JKOPay"],
  "paymentMethodOptions": {
    "CreditCard": {
      "installmentCounts": ["0", "3", "6", "12"]
    },
    "VirtualAccount": {
      "paymentExpireTime": 1440
    },
    "JKOPay": {
      "paymentExpireTime": 120
    },
    "ChaileaseBNPL": {
      "installmentCounts": ["0", "3", "6", "12"],
      "paymentExpireTime": 120
    }
  },
  "order": {
    "products": [{
      "id": "PROD-001",
      "name": "商品名稱",
      "quantity": 1,
      "amount": {
        "value": 100000,
        "currency": "TWD"
      },
      "sku": "SKU-001",
      "desc": "商品描述",
      "url": "https://your-domain.com/product/001"
    }],
    "shipping": {
      "shippingMethod": "宅配",
      "carrier": "黑貓宅配",
      "personalInfo": {
        "firstName": "明",
        "lastName": "王",
        "email": "customer@example.com",
        "phone": "+886912345678"
      },
      "address": {
        "countryCode": "TW",
        "city": "台北市",
        "district": "松山區",
        "street": "敦化北路170號10樓",
        "postcode": "105405"
      }
    }
  },
  "customer": {
    "referenceCustomerId": "CUST-001",
    "type": "0",
    "personalInfo": {
      "firstName": "明",
      "lastName": "王",
      "email": "customer@example.com",
      "phone": "+886912345678"
    }
  },
  "billing": {
    "personalInfo": {
      "firstName": "明",
      "lastName": "王",
      "email": "customer@example.com",
      "phone": "+886912345678"
    },
    "address": {
      "countryCode": "TW",
      "city": "台北市",
      "district": "松山區",
      "street": "敦化北路170號10樓",
      "postcode": "105405"
    }
  },
  "client": {
    "ip": "127.0.0.1",
    "userAgent": "Mozilla/5.0...",
    "language": "zh-TW"
  }
}
```

### 參數說明

#### 基本參數

| 參數 | 類型 | 必填 | 說明 |
|-----|------|------|------|
| `referenceId` | String(32) | 是 | 特店訂單號，不可重複 |
| `amount.value` | Number | 是 | 金額（台幣 × 100），如 100 元傳入 10000 |
| `amount.currency` | String | 是 | 幣種，目前僅支援 `TWD` |
| `returnUrl` | String(256) | 是 | 付款完成後返回的頁面 URL |
| `mode` | String | 是 | 固定填 `regular` |
| `allowPaymentMethodList` | Array | 是 | 允許的付款方式陣列 |
| `order` | Object | 是 | 訂單資訊（參考下方訂單參數） |
| `billing` | Object | 是 | 帳單資訊（參考下方帳單參數） |
| `customer` | Object | 是 | 顧客資訊（參考下方顧客參數） |
| `client` | Object | 是 | 客戶端資訊（至少需包含 `ip`） |
| `expireTime` | Integer | 選填 | 結帳交易逾時時間（分鐘），預設 360 |
| `language` | String(6) | 選填 | 語言（依官方列表） |

> **備註**：欄位必填與否請以官方欄位表為準。

#### 付款方式選項 (paymentMethodOptions)

| 付款方式 | 參數 | 說明 |
|---------|------|------|
| `CreditCard` | `installmentCounts` | 分期期數陣列，`"0"` 為一般交易 |
| `VirtualAccount` | `paymentExpireTime` | ATM 繳費期限（分鐘） |
| `JKOPay` | `paymentExpireTime` | 街口支付期限（分鐘） |
| `ChaileaseBNPL` | `installmentCounts`, `paymentExpireTime` | 中租 zingla 分期設定 |

> **限制**：`ApplePay` 與 `LinePay` **不支援** `paymentMethodOptions`。

#### 允許的付款方式 (allowPaymentMethodList)

| 值 | 說明 |
|---|------|
| `CreditCard` | 信用卡（含分期） |
| `ApplePay` | Apple Pay |
| `LinePay` | LINE Pay |
| `JKOPay` | 街口支付 |
| `VirtualAccount` | ATM 虛擬帳號 |
| `ChaileaseBNPL` | 中租 zingla 銀角零卡 |

## 回應電文 (Response)

### 成功回應 (HTTP 200)

```json
{
  "sessionId": "se_01022502286885089464780754095",
  "referenceId": "ORDER-2026013001",
  "status": "CREATED",
  "amount": {
    "value": 100000,
    "currency": "TWD"
  },
  "sessionUrl": "https://api-sandbox.shoplinepayments.com/checkout/session?sessionToken=xxxx",
  "createTime": "1740711420842"
}
```

### 回應參數說明

| 參數 | 說明 |
|-----|------|
| `sessionId` | SLP 結帳交易訂單編號 |
| `referenceId` | 特店訂單號 |
| `status` | 結帳交易狀態 |
| `sessionUrl` | 付款頁面 URL（導轉顧客至此） |
| `createTime` | 訂單建立時間（時間戳） |

### Session 狀態

| 狀態 | 說明 |
|-----|------|
| `CREATED` | 已建立，等待付款 |
| `PENDING` | 處理中 |
| `SUCCEEDED` | 付款成功 |
| `EXPIRED` | 已過期 |

### 錯誤回應 (HTTP 400/429/500)

```json
{
  "code": "1004",
  "msg": "Param error"
}
```

## 程式碼範例

### Node.js

```javascript
const fetch = require('node-fetch');

async function createCheckoutSession(orderData) {
  const url = 'https://api-sandbox.shoplinepayments.com/api/v1/trade/sessions/create';
  const requestId = Date.now().toString();

  // 拆分中文姓名：第一個字為姓，其餘為名
  const lastName = orderData.customerName ? orderData.customerName.substring(0, 1) : '';
  const firstName = orderData.customerName ? orderData.customerName.substring(1) : '';

  const payload = {
    referenceId: orderData.orderId,
    amount: {
      value: orderData.amount * 100,
      currency: 'TWD'
    },
    returnUrl: orderData.returnUrl,
    mode: 'regular',
    allowPaymentMethodList: orderData.paymentMethods || ['CreditCard', 'LinePay'],
    paymentMethodOptions: {
      CreditCard: {
        installmentCounts: orderData.installments || ['0']
      }
      // 注意：ApplePay 與 LinePay 不支援 paymentMethodOptions
    },
    // order 必填
    order: {
      products: [{
        id: orderData.productId || orderData.orderId,
        name: orderData.productName || '訂單商品',
        quantity: 1,
        amount: { value: orderData.amount * 100, currency: 'TWD' }
      }]
    },
    // customer 必填，personalInfo.lastName 必填
    customer: {
      personalInfo: {
        firstName: firstName,
        lastName: lastName, // 必填
        email: orderData.customerEmail,
        phone: orderData.customerPhone
      }
    },
    // billing 必填，personalInfo.lastName 必填
    billing: {
      personalInfo: {
        firstName: firstName,
        lastName: lastName, // 必填
        email: orderData.customerEmail,
        phone: orderData.customerPhone
      }
    },
    // client 必填
    client: { ip: orderData.clientIp || '127.0.0.1' }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'merchantId': process.env.SHOPLINE_MERCHANT_ID,
      'apiKey': process.env.SHOPLINE_API_KEY,
      'requestId': requestId
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`SHOPLINE Error: ${error.code} - ${error.msg}`);
  }

  return await response.json();
}

module.exports = { createCheckoutSession };
```

### PHP

```php
<?php
function createCheckoutSession($orderData) {
    $url = 'https://api-sandbox.shoplinepayments.com/api/v1/trade/sessions/create';
    $requestId = uniqid();

    $headers = [
        "Content-Type: application/json",
        "merchantId: " . getenv('SHOPLINE_MERCHANT_ID'),
        "apiKey: " . getenv('SHOPLINE_API_KEY'),
        "requestId: $requestId"
    ];

    // 拆分中文姓名
    $name = $orderData['customerName'] ?? '';
    $lastName = mb_substr($name, 0, 1);
    $firstName = mb_substr($name, 1);

    $data = [
        "referenceId" => $orderData['orderId'],
        "amount" => [
            "value" => $orderData['amount'] * 100,
            "currency" => "TWD"
        ],
        "returnUrl" => $orderData['returnUrl'],
        "mode" => "regular",
        "allowPaymentMethodList" => ["CreditCard", "LinePay"],
        "paymentMethodOptions" => [
            "CreditCard" => [
                "installmentCounts" => ["0", "3", "6"]
            ]
            // 注意：ApplePay 與 LinePay 不支援 paymentMethodOptions
        ],
        // order 必填
        "order" => [
            "products" => [[
                "id" => $orderData['orderId'],
                "name" => $orderData['productName'] ?? '訂單商品',
                "quantity" => 1,
                "amount" => ["value" => $orderData['amount'] * 100, "currency" => "TWD"]
            ]]
        ],
        // customer 必填，personalInfo.lastName 必填
        "customer" => [
            "personalInfo" => [
                "firstName" => $firstName,
                "lastName" => $lastName, // 必填
                "email" => $orderData['customerEmail'],
                "phone" => $orderData['customerPhone']
            ]
        ],
        // billing 必填，personalInfo.lastName 必填
        "billing" => [
            "personalInfo" => [
                "firstName" => $firstName,
                "lastName" => $lastName, // 必填
                "email" => $orderData['customerEmail'],
                "phone" => $orderData['customerPhone']
            ]
        ],
        // client 必填
        "client" => ["ip" => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1']
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

## 使用流程

1. **建立結帳交易** - 呼叫此 API 取得 `sessionUrl`
2. **導轉顧客** - 將顧客導轉至 `sessionUrl` 進行付款
3. **付款完成** - 顧客付款後自動導回 `returnUrl`
4. **接收通知** - 透過 Webhook 接收付款結果（參考 [webhook.md](webhook.md)）
5. **查詢確認** - 可主動查詢交易狀態（參考 [query.md](query.md)）
