# D-Plan 全工作流 × Notion 整合 SOP
> 適用版本：D-Plan v4.3 ｜ 10 Steps 完整輸出 ｜ Notion Page ID: 3cdf374300dc8033af23d63306769950

---

## 🚀 每日觸發咒語（複製貼上即可）

```
執行今日 D-Plan 完整工作流（Step 1~10），輸入檔為最新 DataPack JSON，
輸出：本地存檔 DPlan_YYYYMMDD_TEAM_12006.json ＋ 寫入 Notion。
Notion Page ID: 3cdf374300dc8033af23d63306769950
```

---

## 📋 10 Steps 執行對應表

| Step | 標題 | Antigravity 動作 | Notion 寫入區塊 |
|------|------|-----------------|----------------|
| 1 | AI 宏觀風控決策戰情室 | 讀 DataPack → 執行 D-Plan SOP → 輸出 JSON | 📊 Callout(regime/stance) + 現金流表 + 持股清單 + JSON Code Block |
| 2 | 主軸腳本文案 | 基於 Step1 生成 8 分鐘 YouTube 腳本 | 🎬 Toggle「YouTube 長影片腳本」 |
| 3 | 影音 SEO 標題優化 | 基於 Step2 生成標題/Hashtag/說明欄 | 🔍 Toggle「SEO 優化內容」 |
| 4 | 擴散式短影音文案 | 基於 Step1 生成 TikTok/Shorts 腳本 | 📱 Toggle「短影音腳本」 |
| 5 | 擴散式 SEO 標籤 | 基於 Step4 生成短影音標籤 | 🏷️ Toggle「短影音 SEO」 |
| 6 | YouTube CTR 縮圖 | 基於 Step2 生成 16:9 縮圖 Prompt | 🖼️ Toggle「YouTube 縮圖 Prompt」 |
| 7 | 短影音吸睛圖像 | 基於 Step4 生成 9:16 縮圖 Prompt | 📐 Toggle「短影音縮圖 Prompt」 |
| 8 | 風格化行銷海報 | 基於 Step2 生成海報 Prompt | 🎨 Toggle「行銷海報 Prompt」 |
| 9 | Suno AI 情緒配樂 | 基於 Step1 生成配樂指令 | 🎵 Toggle「Suno 配樂 Prompt」 |
| 10 | 全平台社群推播 | 基於 Step1 生成 IG 圖卡+社群文案 | 📢 Toggle「社群推播文案」 |

---

## 📁 本地存檔規則

- 路徑：`c:\Users\sunny\OmniScript PRO\DPlan_YYYYMMDD_TEAM_12006.json`
- 日期格式：`YYYYMMDD`（例如 `DPlan_20261031_TEAM_12006.json`）
- 必須通過 Schema 自檢後才寫檔

---

## 🗂️ Notion 頁面結構（每日自動建立子頁）

```
📅 D-Plan YYYY-MM-DD（子頁標題）
│
├── [Callout] 🏦 市場觀點：regime=XXX | stance=XXX | 美債殖利率=X.XX%
├── [Table] 💵 現金流平衡表（A開盤現金 / B賣出 / C最大動用 / D買進 / E結算）
├── [Bulleted list] 📈 今日持股清單（XX 檔，結算現金 X.XX%）
├── [Code] 📄 D-Plan JSON（完整 v4.3 payload）
│
├── [Toggle] 🎬 Step 2：YouTube 長影片腳本（8 分鐘）
├── [Toggle] 🔍 Step 3：SEO 標題 / Hashtag / 說明欄
├── [Toggle] 📱 Step 4：短影音腳本（TikTok/Shorts 180 秒）
├── [Toggle] 🏷️ Step 5：短影音 SEO 標籤
├── [Toggle] 🖼️ Step 6：YouTube 縮圖 Prompt（16:9）
├── [Toggle] 📐 Step 7：短影音縮圖 Prompt（9:16）
├── [Toggle] 🎨 Step 8：行銷海報 Prompt（16:9）
├── [Toggle] 🎵 Step 9：Suno AI 配樂 Prompt
└── [Toggle] 📢 Step 10：全平台社群推播文案（IG 圖卡 + 各平台）
```

---

## ⚙️ Schema 零容忍自檢（每次 Step 1 後強制執行）

- [ ] `market_view.regime` 必須為 `risk_on` / `neutral` / `risk_off`
- [ ] `market_view.stance` 必須為 `aggressive` / `neutral` / `defensive`
- [ ] `market_view.posture.net_exposure_intent` 必須為 `increase` / `hold` / `reduce`，且須與淨現金流方向一致
- [ ] `observations[i].values` 所有屬性必須為 `number`（禁止 boolean）
- [ ] `sources[i].authority` 只能是 8 個合法值之一
- [ ] 所有時間戳結尾必須為 `+08:00`，嚴禁 `Z`
- [ ] 根節點嚴禁出現 `settled_holdings` 等未定義欄位
- [ ] 持股檔數：20~30 檔
- [ ] 結算現金：2%~10%（約 2,000 萬~1 億元）
- [ ] 美債殖利率 ≥ 5.0% → stance 強制 `defensive`，現金下限升至 6%

---

## 🔑 關鍵設定

| 項目 | 值 |
|------|-----|
| Notion Page ID | `3cdf374300dc8033af23d63306769950` |
| 本地 JSON 輸出路徑 | `c:\Users\sunny\OmniScript PRO\` |
| 檔名格式 | `DPlan_YYYYMMDD_TEAM_12006.json` |
| DataPack 讀取路徑 | `c:\Users\sunny\OmniScript PRO\DataPack_*.json`（最新） |
| Team ID | `TEAM_12006` |
| Schema 版本 | `v4.3` |
