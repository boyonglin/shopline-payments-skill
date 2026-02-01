# 錯誤碼參考

SHOPLINE Payments API 錯誤碼完整列表。

# Server 錯誤碼

## 通用錯誤碼

| 錯誤碼 | 說明 | 英文說明 |
|-------|------|---------|
| 1005 | 校驗錯誤 | Check error |
| 1006 | 紀錄已存在 | Record already exists |
| 1008 | 狀態錯誤 | Status error |
| 1016 | 付款查詢、退款發起請求時，沒有交易紀錄 | No transaction record |
| 1018 | 付款失敗/取消/逾期 & 未知原因 | Business error |
| 1901 | 系統連線失敗 | System connection failed |
| 1902 | 系統內部格式錯誤 | System internal format error |
| 1904 | 請求過於頻繁 | Requests are too frequent |
| 1997 | 資料庫錯誤 | Database error |
| 1998 | 系統配置錯誤 | System configuration error |
| 1999 | 系統異常 | Server error |
| 2001 | APPID 不存在 | APPID does not exist |
| 2002 | 簽名錯誤 | Signature error |
| 2003 | 請求 URL 錯誤 | Request URL error |
| 2004 | 系統內部錯誤 | Internal System Error |
| 2005 | 訪問拒絕 | Access denied |
| 2006 | 錯誤請求 | Bad request |
| 2007 | 無法訪問 | Not found |
| 2008 | 服務無法存取 | Service cannot be accessed |
| 2009 | Token 逾期 | Token expired |
| 2010 | Token 被篡改 | Token tampered |
| 2011 | 付款工具狀態禁止修改 | InstrumentStatus forbidden change |
| 2013 | 商戶未與平台 Connect | Merchants are not connected to the platform |

---

## Connect 錯誤碼

| 錯誤碼 | 說明 | 英文說明 |
|-------|------|---------|
| URL_NOT_FOUND | URL 不存在 | The url does not exist |
| ACCESS_DENIED | apiKey 或 clientKey 不正確/秘鑰與商家 ID 或平台 ID 不符/秘鑰錯誤/商家沒有存取資源權限 | Access Denied |
| MERCHANT_NOT_EXISTS | 特店 ID 不存在 | Merchant information does not exist |
| UNAUTHORIZED_CLIENT | 客戶端 ID 錯誤或授權參數錯誤 | The client is not authorized to access the requested resource |
| SERVER_ERROR | 其他系統錯誤 | System exception |
| KEY_INCORRECT | 平台 Authorize 觸發 connect 綁定時 apiKey 錯誤 | The apiKey or clientKey format is incorrect, please check the parameters |
| INVALID_SCOPE | 授權範圍錯誤 | The requested range parameter value is invalid or not supported by the authorized server |

---

## 下單錯誤碼

| 錯誤碼 | 說明 | 英文說明 |
|-------|------|---------|
| 1001 | 重複下單，交易已存在 | Order exist |
| 1003 | 參數缺失 | Param miss |
| 1004 | 參數錯誤 | Param error |
| 1025 | 超過最大付款限額或不足最低付款限額 | Create amount error |
| 4001 | 通路連線失敗 | Channel connection failed |
| 4002 | 通路錯誤 | Channel error |
| 4003 | 通路回應逾時 | Channel response timeout |
| 4101 | 付款金額不在限額之間 | Wrong amount |
| 4102 | 交易異常，下單失敗 | Payment declined due to order abnormalities |
| 4103 | 未知原因下單失敗 | The payment has been declined for unspecified reasons |
| 4104 | 特店帳戶狀態異常 | Payment declined (issues with merchant account) |
| 4105 | 顧客帳戶狀態異常 | Payment declined (issues with customer account) |
| 4106 | IP 位址未加入白名單 | The payment(s) failed due to system issues |
| 4107 | 交易幣種通路不支援 | Currency not supported |
| 4108 | 喚起付款表單失敗 | Failed to pull up the form |
| 4109 | 網站網域未設定 | Invalid store url |

---

## 付款錯誤碼

### 風控相關

| 錯誤碼 | 說明 | 英文說明 |
|-------|------|---------|
| 3000 | 命中 SLP 風控，使用者行為異常 | Payment declined due to payer/card irregularities |
| 3001 | 命中 SLP 風控，交易卡異常 | Payment declined due to payer/card irregularities |
| 3002 | 命中 SLP 風控，收貨人資訊異常 | Payment declined due to payer/card irregularities |
| 3003 | 命中 SLP 風控，高風險交易 | Payment declined due to payer/card irregularities |
| 3004 | 命中 SLP 風控，交易資訊異常 | Payment declined due to payer/card irregularities |

### 權限相關

| 錯誤碼 | 說明 | 英文說明 |
|-------|------|---------|
| 1012 | 特店付款權限已停用 | Merchant payment permission is disabled |

### 銀行/通路相關

| 錯誤碼 | 說明 | 英文說明 |
|-------|------|---------|
| 4350 | 命中通路/銀行風控 | The payment was rejected by the issuing bank |
| 4400 | 通路系統異常 | The payment failed due to the transaction timed out |
| 4401 | 通路交易逾期 | The payment period has expired |
| 4402 | ATM 繳款金額與訂單金額不一致 | The actual amount paid is different from the set amount |
| 4403 | 系統繁忙 | System Busy |
| 4404 | token 內金額與請求金額錯誤 | Payment token amount not match |
| 4405 | token 非法 | Payment token invalid |
| 4406 | 付款公鑰錯誤 | Payment public key invalid |
| 4407 | 付款私鑰錯誤 | Payment private key invalid |
| 4408 | 付款簽名錯誤 | Payment signature invalid |
| 4409 | token 逾期 | Payment token expires |
| 4410 | 重複付款 | Duplicate payment |
| 4411 | 鑑權失敗 | Payment failed due to technical issue |
| 4412 | 通路介面回應 not found | Payment failed due to technical issue |

### 信用卡相關

| 錯誤碼 | 說明 | 英文說明 |
|-------|------|---------|
| 4450 | 3DS 驗證流程逾時 | The payer did not complete 3D Secure authentication |
| 4451 | 發卡行交易失敗 | The payment was rejected by the issuing bank |
| 4452 | 3DS 驗證不通過 | The payer's attempt at 3D Secure authentication failed |
| 4453 | CVV 驗證不通過 | The CVC number is incorrect |
| 4454 | 餘額不足 | The card has insufficient funds |
| 4455 | 卡號無效 | The card number used is invalid |
| 4456 | 通路系統異常 | The payment failed due to system issues |
| 4457 | 發卡行識別高風險交易 | Payment declined due to payer/card abnormalities |
| 4458 | 交易仍在處理中 | The payment is still being processed |
| 4459 | 信用卡已過期 | The card used has expired |
| 4460 | PIN 輸入次數超限 | The payer exceeded the maximum number of PIN attempts |
| 4461 | 交易金額超過限額 | The payer exceeded their available balance/credit limit |
| 4462 | PIN 驗證不通過 | The PIN entered is invalid |
| 4463 | 被竊/遺失卡 | The payment was declined after being flagged |
| 4464 | 卡被凍結 | The selected card application is blocked |
| 4465 | 需要輸入 PIN | Card requires online pin |
| 4466 | 金融卡受限 | Restricted Card or Invalid card in this country |
| 4467 | 已超交易次數 | The number of withdrawals permitted was exceeded |
| 4468 | 付款碼或收款碼已逾期或無效 | Invalid QR Code, or QR Code has expired |

### 顧客相關

| 錯誤碼 | 說明 | 英文說明 |
|-------|------|---------|
| 4550 | 客戶自主取消交易 | Customer cancellation |
| 4551 | 客戶發起拒付 | Customer dispute |
| 4552 | 顧客付款帳號異常 | Customer account error |
| 4600 | 未知原因 | The payment has been declined for unspecified reasons |

---

## 退款錯誤碼

| 錯誤碼 | 說明 | 英文說明 |
|-------|------|---------|
| 1010 | 退款權限已停用 | Merchant refund permission is disabled |
| 1013 | 退款要求已存在 | The refund request is existing |
| 1014 | 無可退款金額 | Exceeded the allowable refund amount |
| 1015 | 特店帳戶未完成高級認證 | Refund decline (issues with customer account) |
| 1020 | 超過退款時效（180天） | The allowable refund period has expired |
| 1021 | 交易不存在或狀態異常 | The order does not exist or is in exception status |
| 1022 | 商戶餘額不足 | The merchant acc does not have enough balance |
| 1023 | 未知原因退款失敗 | The refund request can not be processed |
| 1202 | 通路不支援線上退款 | Refund is not support currently |
| 4502 | 交易不存在或狀態異常 | The order does not exist or is in exception status |
| 4700 | 交易不存在 | The refund failed because of unknown reasons |
| 4701 | 退款金額超過可退金額 | Refund request amount exceeds order refundable amount |
| 4702 | 商戶餘額不足 | Insufficient merchant account balance |
| 4703 | 已超過可退款時效 | Exceeded the refundable time limit |
| 4704 | 未知原因退款失敗 | The refund failed because of unknown reasons |
| 4705 | 傳輸金額不正確 | Refund failed because of amount not valid |
| 4706 | 上次退款尚在處理中 | The new refund cannot be initiated because the previous refund is still processing |
| 4707 | 該交易不支援部分退款 | Partial refund doesn't support |

---

## 取消授權錯誤碼

| 錯誤碼 | 說明 | 英文說明 |
|-------|------|---------|
| 6001 | 交易處理中，無法取消 | Transaction is processing, can not cancel |
| 6002 | 交易已請款，無法取消 | Can not Cancel the Captured transaction |
| 6003 | 交易已取消，無法再取消 | Can not Cancel the Cancelled transaction |
| 6400 | 交易狀態異常，無法取消 | The transaction status is abnormal and cannot be cancelled |
| 6401 | 通路系統原因導致無法取消 | Can not Cancel for system error |

---

## 請款錯誤碼

| 錯誤碼 | 說明 | 英文說明 |
|-------|------|---------|
| 7001 | 請款金額超過可請款金額 | The capture amount is bigger than the amount that can be captured |
| 7002 | 交易狀態異常，無法請款 | The transaction status is abnormal and cannot be captured |
| 7400 | 交易狀態異常，無法請款 | The transaction status is abnormal and cannot be captured |
| 7401 | 通路系統原因導致無法請款 | Can not Capture for system error |
| 7402 | 請款金額超過可請款金額 | The capture amount is bigger than the amount that can be captured |
| 7403 | 因授權額度問題請款失敗 | Capture fail for bank decline |

---

## 綁卡錯誤碼

| 錯誤碼 | 說明 | 英文說明 |
|-------|------|---------|
| 1200 | 暫不支援綁卡功能 | Card binding is not support currently |
| 1201 | 系統正在處理綁卡，請稍後再試 | Card is cloning |
| 1203 | 卡片驗證失敗 | Card verification is failed |
| 4800 | 未知原因綁卡失敗 | Binding failed due to unknown reason |
| 4801 | 使用者拒絕授權 | The merchant rejected the binding |
| 4802 | 通路參數錯誤 | Bind parameter error |

---

## 定期付款錯誤碼

| 錯誤碼 | 說明 | 英文說明 |
|-------|------|---------|
| 4900 | 需要 3DS，但顧客不在場無法完成 | Need 3DS |
| 4901 | 需要 CVS 認證，但顧客不在場無法完成 | Need cvs |
| 4902 | 其它原因無法完成定期付款 | Saved card payment other error |

---

## SDK 錯誤碼（Server）

| 錯誤碼 | 說明 | 英文說明 |
|-------|------|---------|
| 1009 | 特店 SLP 收款權限已停用 | Receive forbidden |
| 4200 | 特店暫未綁定該付款通路 | Payment method not activated |
| 4201 | 特店暫無使用權限 | The payment failed due to merchant account invalid |
| 4202 | 通路或付款方式暫時不支援該交易幣種 | Currency not support |
| 4203 | 特店收款帳戶狀態異常 | Merchant payment permission is disabled |
| 4204 | 暫不支援該付款方式 | This payment method is not currently supported |

---

## SDK 錯誤碼（Client）

前端 JS SDK 回傳的錯誤碼。

### 初始化與環境錯誤

| 錯誤碼 | 說明 | 英文說明 |
|-------|------|---------|
| 1026 | 不支援瀏覽器 | Browser version old |
| 1027 | SDK 內部錯誤 | Inner error |
| 1028 | 初始化呈現失敗（兜底錯誤碼） | Init error |
| 1029 | SDK 未完成呈現，呼叫了其他 API | Render not finish |
| 1100 | 當前設備環境不支援該付款方式 | Device not support |
| 1101 | 載入通路 JS 出錯 | Loading payment method js error |
| 1102 | 介面回應入參出錯，配置出錯 | API request parameter error |
| 1105 | 當前環境為非 HTTPS | Https needed |
| 1106 | 建立訂單時脫離使用者操作 | Payment method instance user action needed |
| 1107 | 其他建立實例未識別到的錯誤 | Payment method instance other error |
| 1108 | 初始化 SDK 逾時 | Over time |
| 1109 | 網路錯誤 | Network error |
| 1111 | 載入內部 JS 出錯 | Loading inner js error |
| 1112 | 顧客輸入錯誤 | Incorrect user input |

### 交易與付款方式錯誤

| 錯誤碼 | 說明 | 英文說明 |
|-------|------|---------|
| 4108 | 喚起通路付款表單失敗 | Failed to pull up the form |
| 4110 | 建立通道實例失敗 | Failed to create PaySession instance |
| 4111 | nextAction 入參出錯 | nextAction input parameter error |
| 4205 | 交易異常（交易狀態未知） | Transaction abnormal |
| 4206 | 該 API 不支援該付款方式 | The API does not support the payment method |
| 4207 | 呈現 dom 不存在 | The current transaction requires dom elements |
| 4208 | SDK 入參出錯 | Init data error |
| 4550 | 顧客取消付款表單 | Customer cancellation |

### 信用卡驗證錯誤

| 錯誤碼 | 說明 | 英文說明 |
|-------|------|---------|
| 43000 | 目前卡的卡組不支援 | The scheme of your credit card is not currently supported |
| 43001 | 目前卡的發卡銀行不支援 | The issuing bank of your credit card is not currently supported |
| 43002 | 當前卡的卡類型不支援 | The type of your credit card is not currently supported |
| 43003 | 目前卡片的發卡國家不支援 | The issuing country of your credit card is not currently supported |
| 43004 | 當前卡的卡等級不支援 | The category of your credit card is not currently supported |
| 43005 | 目前卡片的卡片系列不支援（即卡 BIN 不支援） | The series of your credit card is not currently supported |
| 43006 | 目前分期期數不支援 | The period of installments is not supported |
| 43007 | 暫不支援該付款方式（目前特店 ID 不支援） | This payment method is not currently supported (current merchant ID is not supported) |
| 43008 | 暫不支援此金額進行交易 | This amount of transactions is not currently supported |
| 43009 | 目前付款方式正在維護中 | The payment method is under maintenance |
| 43010 | 身分資訊核驗異常 | Please enter a valid Number |
| 43011 | 超出身分資訊核驗次數 | The identity information has been wrong 3 times today, please try again tomorrow |
