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

## 官方支援清單

請以官方文件為準：

- [一般付款](https://docs.shoplinepayments.com/guide/normal/)
- [快捷/綁定付款](https://docs.shoplinepayments.com/guide/quick/)

若需設定允許的付款方式與選項，請參考：

- https://docs.shoplinepayments.com/api/trade/session/

## 付款方式比較

| 付款方式 | 即時付款 | 分期 | 退款方式 | 手續費參考 |
|---------|---------|------|---------|----------|
| 信用卡 | 是 | 是 | 線上 | 2.0% ~ 2.5% |
| Apple Pay | 是 | 否 | 線上 | 2.0% ~ 2.5% |
| LINE Pay | 是 | 否 | 線上 | 2.0% ~ 2.5% |
| 街口支付 | 是 | 否 | 線上 | 依合約 |
| ATM 虛擬帳號 | 否 | 否 | 線下/部分線上 | 固定費用 |
| 中租 zingla | 否 | 是 | 線上 | 依期數 |

## 注意事項

1. 各付款方式的啟用需向 SHOPLINE Payments 申請
2. 手續費率依合約而定，上表僅供參考
3. 部分付款方式可能有金額限制
4. ATM 虛擬帳號的退款可能需要線下處理
