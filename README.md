# SHOPLINE Payments Skill

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

SHOPLINE Payments 金流串接 Skill for AI Agents - 支援 LINE Pay、信用卡、ATM、街口支付等台灣在地付款方式

支援 Claude Code、Cursor、Codex、GitHub Copilot 等 AI coding agents。

## 功能

此 Skill 教導 AI coding assistants 如何串接 SHOPLINE Payments 金流，包含：

| 功能 | 說明 |
|------|------|
| 建立結帳交易 | 導轉式結帳，取得 sessionUrl 導向 SHOPLINE 付款頁 |
| Webhook 處理 | 簽章驗證與付款結果通知 |
| 交易查詢 | 查詢結帳/付款交易狀態 |
| 退款作業 | 建立退款交易 |
| 請款/取消 | 信用卡請款與取消授權 |

### 支援的付款方式

- 信用卡（一次付清、分期）
- 行動支付（LINE Pay、街口支付 JKO Pay）
- ATM 虛擬帳號轉帳

## 安裝

### 方式一：npx skills（推薦）

使用 [skills CLI](https://skills.sh/) 安裝：

```bash
npx skills add boyonglin/shopline-payments-skill
```

支援多種 AI coding agents：Claude Code、Cursor、Codex、GitHub Copilot、Roo Code 等。

### 方式二：手動安裝

```bash
# 下載 repository
git clone https://github.com/boyonglin/shopline-payments-skill.git

# 複製到你的專案（Claude Code）
cp -r shopline-payments-skill/. your-project/.claude/skills/shopline-payments/

# 或複製到全域目錄
cp -r shopline-payments-skill/. ~/.claude/skills/shopline-payments/
```

### 方式三：直接上傳

在 Claude.ai 的 skill 設定中直接上傳 `SKILL.md` 檔案。

## 使用方式

### 自動觸發

在對話中提到相關關鍵字時，Claude 會自動載入此 skill：

```
> 幫我串接 SHOPLINE Payments
> 我想用 LINE Pay 收款
> SHOPLINE 金流怎麼串接
```

### 觸發關鍵字

| 關鍵字 |
|--------|
| SHOPLINE、SHOPLINE Payments |
| shopline 金流、shopline 付款 |
| sessionUrl、導轉式付款 |

## 目錄結構

```
shopline-payments-skill/
├── SKILL.md              # 主要 skill 指令
├── marketplace.json      # Marketplace 元資料
├── README.md             # 說明文件
├── references/           # 詳細文檔
│   ├── redirect.md       # 導轉式結帳交易 API
│   ├── embedded.md       # 嵌入式結帳 API
│   ├── query.md          # 交易查詢 API
│   ├── refund.md         # 退款 API
│   ├── capture-cancel.md # 請款/取消 API
│   ├── webhook.md        # Webhook 處理
│   ├── error-codes.md    # 錯誤碼參考
│   ├── sandbox.md        # 沙盒測試指南
│   └── payment-methods.md # 付款方式說明
└── scripts/              # 程式碼範例
    ├── checkout.js       # 結帳串接實作
    ├── webhook.js        # Webhook 驗證
    └── gas-integration.js # Google Apps Script 整合
```

## 注意事項

- SHOPLINE Payments API 文件版權歸原業者所有
- 請以 SHOPLINE 官方最新文件為準
- `apiKey`、`signKey` 等敏感資訊請妥善保管，不可暴露於前端

## 相關資源

- [SHOPLINE Payments 官方文件](https://docs.shoplinepayments.com/)
