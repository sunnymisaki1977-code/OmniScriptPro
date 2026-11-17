# OmniScript PRO 🚀
**企業級 AI 知識轉譯與自動化產製工作流 (Enterprise AI Knowledge Translation & Automation Workflow)**

> 本專案旨在解決企業內部龐雜的「非結構化知識（如：ERP 原廠手冊、MES 產線規範、法規規章、業務流程）」難以傳遞的痛點。透過導入 RAG（檢索增強生成）與 LLM 工作流，將生硬文件自動轉譯為產線、客服與行政端「秒懂」的防呆圖文 SOP 與自動化短影音腳本，大幅降低教育訓練成本與系統導入初期的抗拒心理。

---

## 💡 為什麼開發這個系統？（從 14 年營運痛點出發）
在過去 14 年的電商營運與跨部門管理經驗中，我深刻體認到企業數位轉型的最大阻力往往不是技術，而是**「知識傳遞的摩擦力」**。
傳統 IT 團隊產出的系統手冊往往缺乏商業直覺，導致第一線人員抗拒、客服成本暴增。**OmniScript PRO** 正是為此而生——它結合了「高階營運管理者的商業邏輯」與「現代化 AI 轉譯技術」，扮演連接業務需求與技術底層的關鍵橋樑。

---

## 🛠 核心技術棧 (Tech Stack)
本專案採用現代化 Web 架構與多模型 AI API 進行端到端 (End-to-End) 開發：
*   **Frontend:** React, Next.js, TypeScript, Tailwind CSS
*   **Backend & Data Processing:** Python (用於進階資料清洗、影音腳本後期處理與自動化腳本), Node.js
*   **Integration:** Notion API, RSS Feeds, RESTful APIs
*   **AI Models:** Claude (Anthropic), Gemini (Google)
*   **Architecture:** 基於 RAG (Retrieval-Augmented Generation) 的防幻覺知識庫架構與可擴充多主題模組化設計
*   **Deployment:** Vercel

---

## 🤖 AI 協作開發實踐 (Vibe Coding)
本系統的開發過程高度重視 **AI 在實際軟體工程中的價值**。全端架構由我本人透過 **Cursor** 與 **Google Antigravity**，結合 **Claude 3.5 Sonnet** 與 **Gemini** 進行高強度的 AI 協作編程 (Vibe Coding) 打造。

在開發過程中，我的核心價值在於「架構決策」與「品質驗證」：
1.  **領域驅動設計 (DDD) 與 Prompt 封裝：** 由我制定商業邏輯與 API 規格，並透過精準的 System Prompt 指導 AI 快速產出高內聚、低耦合的前端組件與後端腳本。
2.  **嚴格的幻覺控管 (Hallucination Control)：** 針對 RAG 系統產出的內容，我透過寫入定錨參數與 System Prompt 邊界限制，確保 AI 轉譯的企業知識 100% 符合原始法規與 SOP。
3.  **商業邏輯審查與現場防呆：** 絕不盲目複製貼上。我運用 14 年的營運底氣，親自審查 AI 產出的狀態管理與權限控管 (RBAC) 邏輯，確保防呆機制真正符合現場工作流。

---

## ✨ 核心功能模組 (Key Features)
1.  **動態知識庫檢索 (Dynamic RAG):** 自動讀取並向量化企業內部文件，提供精準的內部 QA 問答。
2.  **智能轉譯引擎 (Smart Translation Engine):** 將繁瑣的技術文件與操作手冊，一鍵轉換為圖文並茂的 SOP 或教育訓練素材。
3.  **多模態輸出 (Multimodal Output):** 整合 Python 腳本，自動對接 CapCut (剪映) 產製帶有運鏡與字幕的短影音，實現教育訓練自動化。
4.  **現代化儀表板 (Dashboard):** 提供直觀的數據可視化介面，讓管理層輕鬆掌握知識庫的使用狀況與轉譯成效。
5.  **多主題擴充架構 (Multi-Theme Framework):** 支援教育培訓 (EdTech)、企業內控等多場景主題擴充，具備模組解耦與獨立 Canvas 輕量運行能力。

---

## 🚀 未來展望 (Roadmap)
接下來的迭代計畫將對齊中大型企業的內部資安與系統治理規範：
*   [ ] 整合 LDAP / AD 企業身分驗證，落實部門與角色的存取權限控管 (RBAC)。
*   [ ] 對接企業核心系統 (ERP / MES / EasyFlow BPM) API 接口，實現跨系統知識即時同步與自動化回饋。
*   [ ] 建立自動化 CI/CD 測試與部署流程。
*   [ ] 開發專屬的內部 Agent 執行框架 (Harness)，進一步降低 AI 呼叫延遲與成本。

---

*Created by [Shi-Ming, Jiang (江世銘)]*  
*A Full-Stack Developer & AI Solutions Architect bridging the gap between Operations and Technology.*
