# SHOPLINE Payments Skill

A comprehensive guide for integrating SHOPLINE Payments in Taiwan, including redirect-based checkout, webhooks, refunds, and more.

## 🎯 What This Skill Does

This skill teaches AI coding assistants how to integrate SHOPLINE Payments for Taiwan merchants. It covers:

- **Checkout Sessions** - Create payment sessions and redirect customers to SHOPLINE's hosted payment page
- **Webhooks** - Verify signatures and handle payment notifications
- **Transactions** - Query payment status, process refunds, capture/cancel authorizations
- **Payment Methods** - Support for LINE Pay, credit cards, ATM transfers, JKO Pay, and more

## 📦 Installation

### For Claude Code

Copy this folder to your project's `.claude/skills/` directory:

```bash
# Clone the repository
git clone https://github.com/boyonglin/shopline-payments-skill.git

# Copy to your project
cp -r shopline-payments-skill/.  your-project/.claude/skills/shopline-payments/
```

Or install via openskills:

```bash
npx openskills install boyonglin/shopline-payments-skill
```

### For Claude.ai

Upload the `SKILL.md` file directly in Claude's skill settings.

## 📁 Structure

```
shopline-payments/
├── SKILL.md              # Main skill instructions
├── marketplace.json      # Marketplace metadata
├── README.md             # This file
├── references/           # Detailed documentation
│   ├── checkout.md       # Checkout session API
│   ├── query.md          # Transaction query API
│   ├── refund.md         # Refund API
│   ├── capture-cancel.md # Capture/Cancel API
│   ├── webhook.md        # Webhook handling
│   ├── error-codes.md    # Error code reference
│   ├── sandbox.md        # Sandbox testing guide
│   └── payment-methods.md # Supported payment methods
└── scripts/              # Code examples
    ├── checkout.js       # Checkout implementation
    ├── webhook.js        # Webhook verification
    └── gas-integration.js # Google Apps Script integration
```

## 🔗 Resources

- [SHOPLINE Payments Documentation](https://docs.shoplinepayments.com/)
- [API Reference](https://api.shoplinepayments.com/docs)

## 📄 License

MIT License - Feel free to use and modify.

## 👤 Author

**Clancy Lin** - [GitHub](https://github.com/boyonglin)
