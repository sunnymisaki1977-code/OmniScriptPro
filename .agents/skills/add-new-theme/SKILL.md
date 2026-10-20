---
name: omniscript-add-theme
description: 當使用者要求在 OmniScript PRO 專案中新增一個完整的「受眾主題（Theme）」或「工作流（Workflow）」時，請啟動此技能以確保所有關聯檔案都被正確更新。
---

# 建立新受眾主題 (Add New Theme) 開發指南

當使用者要求在系統中新增一個全新的受眾主題（例如 `competition`, `fintech`, 等）並提供 10 個步驟的 AI 生成腳本時，AI 代理（Agent）**必須嚴格遵循以下 6 個標準作業程序 (SOP)** 來進行開發，以避免遺漏任何設定導致 Vercel 編譯失敗或功能異常。

## 前置作業與檢查清單
在開始寫程式前，請向使用者確認已取得以下兩項重要資訊：
1. **主題的英文代號 (Theme ID)**：例如 `competition`, `fintech` 等。
2. **對應的 Notion Database ID**：例如 `3bdf374300dc80769461f8d6d1afaf22`。

## 執行步驟 (Step-by-Step)

### Step 1: 寫入 10 步驟提示詞設定 (`src/utils/promptConfigs.ts`)
- 將使用者提供的 10 步驟 JSON 陣列，以新的鍵值（Theme ID）新增到 `WORKFLOWS_REGISTRY` 之中。
- **⚠️ 嚴格注意語法正確性**：
  - 陣列必須包含在 `WORKFLOWS_REGISTRY` 物件的 `{}` 內。
  - 新增屬性時，確保前一個屬性的陣列結尾 `]` 後方有加上逗號 `,`。
  - 每個步驟物件 `{ id: ... }` 之間必須有逗號 `,` 隔開。
  - 注意字串或模板字面量 (Template literal) 的反引號 `` ` `` 與 `}` 的閉合情況，這是最常發生語法錯誤（Syntax Error）導致 Next.js 建置失敗的地方。

### Step 2: 註冊後端身分驗證與路由 (`src/app/api/auth/route.ts`)
- 在 `ACCESS_CODES` 物件中新增兩組對應：
  - `[大寫 THEME_ID]2026`: `'[小寫 theme_id]'` （例如 `'COMPETITION2026': 'competition'`）
  - `[大寫 THEME_ID]`: `'[小寫 theme_id]'` （提供無年份後綴的快捷登入）
- 在 `apiEndpoints` 物件中，新增路由對應：
  - `'[小寫 theme_id]': 'https://omni-script-pro.vercel.app/api/[小寫 theme_id]-notion'`

### Step 3: 更新一般版前端介面 (`CanvaApp.js/OmniScript PRO_os.tsx`)
- 在 `getThemeLabel` 函數中，加入新主題的中文化對應標籤。
- 在前端的登入提示區域（Hint 按鈕區塊）加入新的捷徑按鈕，讓使用者可以點擊自動填寫通行碼（例如 `COMPETITION2026`）。

### Step 4: 更新純 Gemini 版前端介面 (`CanvaApp.js/OmniScript PRO_os_gemini.tsx`)
- 執行與 Step 3 **完全相同**的修改，確保兩個前端應用程式保持同步。

### Step 5: 建立專屬 Notion 寫入路由 (`src/app/api/[theme_id]-notion/route.ts`)
- 複製現有的 Notion 路由（例如 `api/heritage-notion/route.ts`），建立一個與該主題對應的專屬 API Route。
- 修改檔案內的 Notion Database ID，指向使用者提供的專屬資料庫 ID。
- 檢查資料庫的 Properties 屬性，確保對應的新 Notion DB 中具備相同的欄位（移除其他主題專屬但新資料庫不存在的欄位，以免發生 Properties Not Found 錯誤）。

### Step 6: 串接 Notion 歷史紀錄讀取 (`src/app/api/notion/history/route.ts`)
- 在 `fetchArchives` 函式中，新增 `if (theme === '[theme_id]')` 的條件分支。
- 確保該分支能夠使用專屬的 Notion Database ID 進行查詢，讓使用者能順利匯入先前的歷史紀錄。

### Step 7: 更新 Extreme 模式的匯出映射 (`src/app/api/Extreme/export/route.ts`)
- 在 `themeToFolderMap` 物件中加入新主題的映射（例如：`'competition': '競賽企劃'`），確保 Extreme 模式能正確對應到剪映 (JianyingPro) 的草稿資料夾名稱。

### Step 8: 更新主題專屬繪圖風格 (`src/utils/styleConfigs.ts`)
- 在 `AUDIENCE_STYLES` 中加入新主題的預設風格設定檔（包含 `id`, `name`, `promptSuffix`），讓使用者在生成圖像時有專屬的美學風格可以選擇。

---

## 結尾驗證
完成上述 6 個步驟後：
1. 務必在終端機先執行一次 `npm run build`，檢查是否出現 Syntax Error 或是 Dynamic Server Usage 的意外中斷。
2. 若編譯成功，使用 `git commit` 與 `git push` 推送程式碼，並請使用者等待 1 分鐘後重新整理頁面。
