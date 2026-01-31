# 支援的付款方式

SHOPLINE Payments 支援多種付款方式。

## 付款方式一覽

| 付款方式 | 識別碼 | 串接方式 | 說明 |
|---------|-------|---------|------|
| 信用卡 | `CreditCard` | 導轉/內嵌 | 一般交易、分期 |
| Apple Pay | `ApplePay` | 導轉/內嵌 | 行動支付 |
| LINE Pay | `LinePay` | 導轉 | 行動支付 |
| 街口支付 | `JKOPay` | 導轉 | 行動支付 |
| ATM 虛擬帳號 | `VirtualAccount` | 導轉 | 銀行轉帳 |
| 中租 zingla | `ChaileaseBNPL` | 導轉 | 銀角零卡分期 |

---

## 信用卡 (CreditCard)

SHOPLINE Payments 擁有 PCI DSS Level 1 認證，可安全處理信用卡資訊。

### 支援的卡組織

| 交易類型 | 支援卡組織 |
|---------|----------|
| 一般交易 | Visa / MasterCard / JCB / UnionPay |
| 分期交易 | Visa / MasterCard / JCB |

### 分期期數與銀行

| 期數 | 支援銀行 |
|-----|---------|
| 3 期 | 台新、中國信託、玉山、凱基、國泰世華、聯邦、永豐、星展 |
| 6 期 | 台新、中國信託、玉山、凱基、國泰世華、聯邦、永豐、星展 |
| 9 期 | 台新、中國信託、凱基、國泰世華、聯邦、星展 |
| 12 期 | 台新、中國信託、玉山、凱基、國泰世華、聯邦、永豐、星展 |
| 18 期 | 台新、中國信託、玉山、凱基、國泰世華、聯邦、星展 |
| 24 期 | 台新、中國信託、玉山、凱基、國泰世華、聯邦、星展 |

### 設定範例

```json
{
  "allowPaymentMethodList": ["CreditCard"],
  "paymentMethodOptions": {
    "CreditCard": {
      "installmentCounts": ["0", "3", "6", "12"]
    }
  }
}
```

- `"0"` 表示一般交易（不分期）
- 若不設定 `installmentCounts`，預設只支援一般交易

### 進階功能（內嵌式）

| 功能 | 說明 |
|-----|------|
| 綁卡 | 儲存顧客信用卡資訊 |
| 快捷付款 | 使用已綁定的卡片快速付款 |
| 定期扣款 | 定期自動扣款 |

---

## Apple Pay

### 說明

Apple Pay 是 Apple 提供的行動支付服務，顧客可透過 iPhone、iPad、Mac 或 Apple Watch 完成付款。

### 使用條件

- 顧客需有支援 Apple Pay 的 Apple 裝置
- 顧客需在 Apple Wallet 中綁定信用卡

### 設定範例

```json
{
  "allowPaymentMethodList": ["ApplePay"]
}
```

> 注意：Apple Pay 暫不支援 `paymentMethodOptions` 設定

---

## LINE Pay

### 說明

LINE Pay 是 LINE 提供的行動支付服務，顧客透過 LINE App 完成付款。

### 特點

- 廣泛的用戶基礎
- 支援 LINE Points 折抵

### 設定範例

```json
{
  "allowPaymentMethodList": ["LinePay"]
}
```

> 注意：LINE Pay 暫不支援 `paymentMethodOptions` 設定

---

## 街口支付 (JKOPay)

### 說明

街口支付是台灣本土的行動支付服務。

### 設定範例

```json
{
  "allowPaymentMethodList": ["JKOPay"],
  "paymentMethodOptions": {
    "JKOPay": {
      "paymentExpireTime": 120
    }
  }
}
```

| 參數 | 說明 |
|-----|------|
| `paymentExpireTime` | 付款期限（分鐘） |

---

## ATM 虛擬帳號 (VirtualAccount)

### 說明

系統產生專屬虛擬帳號，顧客可透過 ATM 或網路銀行轉帳付款。

### 特點

- 不需信用卡
- 適合大額交易
- 需等待顧客轉帳

### 設定範例

```json
{
  "allowPaymentMethodList": ["VirtualAccount"],
  "paymentMethodOptions": {
    "VirtualAccount": {
      "paymentExpireTime": 1440
    }
  }
}
```

| 參數 | 說明 |
|-----|------|
| `paymentExpireTime` | 繳費期限（分鐘），1440 = 24 小時 |

### 注意事項

- 顧客需在期限內轉帳
- 轉帳金額需與訂單金額完全一致
- 不支援線上退款（部分情況）

---

## 中租 zingla 銀角零卡 (ChaileaseBNPL)

### 說明

中租控股提供的「先買後付」(Buy Now Pay Later) 服務，讓顧客不需信用卡也能分期付款。

### 設定範例

```json
{
  "allowPaymentMethodList": ["ChaileaseBNPL"],
  "paymentMethodOptions": {
    "ChaileaseBNPL": {
      "installmentCounts": ["3", "6", "12"],
      "paymentExpireTime": 120
    }
  }
}
```

| 參數 | 說明 |
|-----|------|
| `installmentCounts` | 分期期數 |
| `paymentExpireTime` | 付款期限（分鐘） |

---

## 組合使用範例

### 完整付款選項

```json
{
  "allowPaymentMethodList": [
    "CreditCard",
    "ApplePay",
    "LinePay",
    "JKOPay",
    "VirtualAccount",
    "ChaileaseBNPL"
  ],
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
      "installmentCounts": ["3", "6", "12"],
      "paymentExpireTime": 120
    }
  }
}
```

### 僅信用卡與 LINE Pay

```json
{
  "allowPaymentMethodList": ["CreditCard", "LinePay"],
  "paymentMethodOptions": {
    "CreditCard": {
      "installmentCounts": ["0", "3", "6"]
    }
  }
}
```

### 僅 ATM 轉帳

```json
{
  "allowPaymentMethodList": ["VirtualAccount"],
  "paymentMethodOptions": {
    "VirtualAccount": {
      "paymentExpireTime": 2880
    }
  }
}
```

---

## 付款方式比較

| 付款方式 | 即時付款 | 分期 | 退款方式 | 手續費參考 |
|---------|---------|------|---------|----------|
| 信用卡 | ✓ | ✓ | 線上 | 2.0% ~ 2.5% |
| Apple Pay | ✓ | ✗ | 線上 | 2.0% ~ 2.5% |
| LINE Pay | ✓ | ✗ | 線上 | 2.0% ~ 2.5% |
| 街口支付 | ✓ | ✗ | 線上 | 依合約 |
| ATM 虛擬帳號 | ✗ | ✗ | 線下/部分線上 | 固定費用 |
| 中租 zingla | ✗ | ✓ | 線上 | 依期數 |

## 注意事項

1. 各付款方式的啟用需向 SHOPLINE Payments 申請
2. 手續費率依合約而定，上表僅供參考
3. 部分付款方式可能有金額限制
4. ATM 虛擬帳號的退款可能需要線下處理
