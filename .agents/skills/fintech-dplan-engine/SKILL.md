---
name: fintech-dplan-engine
description: 當使用者要求執行【7. AI 宏觀風控與選股決策引擎】、產生玉山 AI CUP 每日 D-Plan v4.3 交易書 JSON、進行盤前數據定錨、持股再平衡或現金流檢核時，請啟動此技能以確保 100% 通過官方後台驗證。
---

# 玉山 AI CUP D-Plan v4.3 決策與交易書自動生成指南

本技能為【7. AI 宏觀風控與選股決策引擎】的專屬標準作業程序 (SOP)，旨在確保產出的 D-Plan 交易書 100% 通過官方驗證系統，達成「零語法錯誤、零現金透支、推導股數 100% 一致」。

---

## 🚨 生死線：四大不可違反之硬性約束

1. **持股檔數限制**：每日結算後之持股總檔數，必須強制落在 **20 ~ 30 檔** 之間。
2. **交易標的池限制**：買進個股 **只能** 從大會指定之 150 檔合法代碼中挑選，嚴禁購買池外標的。
3. **單一持股權重上限**：2330 台積電 $\le 25\%$，其餘個股 $\le 10\%$（加碼時請預留 0.5% 緩衝）。
4. **Active Share 主動投資比率**：前 15 大持股與指定 30 檔主動型 ETF 相比，Active Share 必須 $\ge 15\%$（建議維持 $> 20\%$）。

---

## ⚙️ 核心演算法與計算鐵律

### 1. 現金流守恆與防透支鐵律
- **最大可買進預算上限 (Buying Power)**：
  $$\text{Buying Power} = \text{開盤可用現金} + \text{今日賣出成交回收現金} - 20,000,000 \text{ 元}$$
- 🚨 **絕對禁止超買透支**：今日所有加碼或買進股票（BUY / ADD）所耗費的總金額，**絕對不得超過**上述預算上限！若現金不足，必須「先賣足額持股變現」或「縮小加碼股數」。
- 結算剩餘現金必須維持在 **2% ~ 10%**（約 2,000 萬至 1 億元整），嚴禁為負數。

### 2. 委託股數推導一致性公式 (避免警告關鍵)
大會後端驗證系統使用 DataPack 內提供的 **真實結算淨值 (`account.nav_tradable`)** 計算，而非整數 10 億：
$$\text{目標股數} = \lfloor \frac{\text{目標權重} \times \text{account.nav\_tradable}}{\text{今日收盤價} \times 1000} \rfloor \times 1000$$
$$\text{委託股數} = |\text{目標股數} - \text{原持有股數}|$$

---

## 📋 官方 JSON Schema 零容忍檢查清單

產出 D-Plan JSON 時，必須執行嚴格自檢：
- [ ] **根節點乾淨度**：大會規範 `additionalProperties: false`，根層級 **嚴禁出現未定義欄位**（例如嚴禁出現 `settled_holdings`）。
- [ ] **權威機構代碼 (Authority)**：`sources[i].authority` 只能是以下 8 個合法值：`twse` / `tpex` / `taifex` / `mops` / `fininst` / `media` / `vendor` / `other`。外網或報價網站請填 `vendor`。
- [ ] **時間戳嚴格時區 (+08:00)**：所有 ISO 8601 時間字串（包含 `content_as_of`, `run_started_at`, `run_completed_at`）結尾 **必須強制為 `+08:00`**，嚴禁以 `Z` 結尾。

---

## 🚀 執行流程 (Step-by-Step)

1. **讀取最新 DataPack**：
   - 尋找工作區中最新的 `DataPack_*.json` 檔案。
   - 提取 `account.cash`（開盤現金）、`account.nav_tradable`（真實淨值）以及昨日持股明細。
2. **抓取清晨行情**：
   - 確認美股指數、TSM ADR、NVDA 收盤價及台指期夜盤點位。
3. **進行資金調度試算**：
   - 先計算預計賣出標的釋放的流動性。
   - 確保加碼標的之總支出小於可動用預算。
4. **生成交易書與驗證**：
   - 執行現有自動化腳本：`node scripts/auto-dplan-daily.js`。
   - 確認產出之 `DPlan_YYYYMMDD_TEAM_12006.json` 格式無誤、四檔委託推導與提交股數完全一致。
