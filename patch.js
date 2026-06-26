const fs = require('fs');
let code = fs.readFileSync('src/components/Workspace.tsx', 'utf8');

// 1. Add imports
code = code.replace('import toast from "react-hot-toast";', 'import toast from "react-hot-toast";\nimport { GoogleGenAI } from "@google/genai";\nimport { List, X } from "lucide-react";');

// 2. Add States and Notion History logic
const stateInsertionPoint = 'const [editedContent, setEditedContent] = useState("");';
const historyLogic = `
  const [editedContent, setEditedContent] = useState("");
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/notion/history");
      const data = await res.json();
      if (data.history) setHistoryList(data.history);
    } catch (err) {
      console.error("載入歷史紀錄失敗", err);
    }
  };

  const loadHistoryItem = async (id: string) => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch(\`/api/notion/history?id=\${id}\`);
      const data = await res.json();
      if (data.stepsData) {
        for (let i = 1; i <= 10; i++) {
           updateStepData(i, data.stepsData[i] || "");
        }
        setCurrentStep(1);
        toast.success("成功載入歷史紀錄");
        setShowHistory(false);
      }
    } catch (err) {
      toast.error("載入紀錄失敗");
    } finally {
      setIsLoadingHistory(false);
    }
  };
`;
code = code.replace(stateInsertionPoint, historyLogic);

// 3. Rewrite startAutoGenerate
const oldStartAutoGenerateRegex = /const startAutoGenerate = async.*?setIsAutoGenerating\(false\);\s*setAutoProgress\(0\);\s*}\s*};\n/s;
const newStartAutoGenerate = `const startAutoGenerate = async (isResume = false) => {
    setIsAutoGenerating(true);
    let startFromStep = 1;
    if (isResume) {
      for (let i = 1; i <= 10; i++) {
        if (!stepsData[i]) {
          startFromStep = i;
          break;
        }
      }
      if (startFromStep > 10) {
        toast.success("所有步驟已完成！");
        setIsAutoGenerating(false);
        return;
      }
    }
    
    setAutoProgress(startFromStep);
    setCurrentStep(startFromStep);
    
    const visualTimer = setInterval(() => {
      setAutoProgress((prev) => (prev < 10 ? prev + 1 : startFromStep));
      setCurrentStep((prev) => (prev < 10 ? prev + 1 : startFromStep));
    }, 3500);
    
    try {
      let currentDocText = stepsData[1] || "";
      let currentData = { ...stepsData };
      let lastSuccessStep = startFromStep - 1;
      const CHUNK_SIZE = 3;
      let currentStart = startFromStep;

      // 取得 Canva 環境的 API Key，此處示意可從 localStorage 或 Env 讀取
      const canvaApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || localStorage.getItem("canva_api_key") || "";
      if (!canvaApiKey) throw new Error("找不到 Canva/Gemini API Key，請確認環境變數或設定");

      const ai = new GoogleGenAI({ apiKey: canvaApiKey });

      while (currentStart <= 10) {
        const currentEnd = Math.min(currentStart + CHUNK_SIZE - 1, 10);
        setAutoProgress(currentStart);
        setCurrentStep(currentStart);

        // 1. 呼叫 Vercel API 組裝 Prompt
        const assembleRes = await fetch("/api/prompts/assemble", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            theme, 
            customDocText: currentDocText,
            startFromStep: currentStart,
            endStep: currentEnd,
            existingData: currentData
          }),
        });

        if (!assembleRes.ok) throw new Error("組裝 Prompt 失敗");
        const assembleJson = await assembleRes.json();
        const masterPrompt = assembleJson.prompt;
        
        if (assembleJson.verifiedContext && !currentDocText) {
          currentDocText = assembleJson.verifiedContext;
          currentData[1] = currentDocText;
          updateStepData(1, currentDocText);
        }

        // 2. 在前端直接呼叫 Google API 進行生成
        const aiRes = await ai.models.generateContent({
          model: "gemini-2.5-pro",
          contents: masterPrompt
        });

        const text = aiRes.text || "{}";
        const cleanText = text.replace(/^\`\`\`json\s*/i, "").replace(/^\`\`\`\s*/, "").replace(/\`\`\`$/i, "").trim();
        let newData;
        try {
          newData = JSON.parse(cleanText);
        } catch(e) {
           throw new Error("AI 回傳的 JSON 格式錯誤");
        }
        
        for (let i = currentStart; i <= currentEnd; i++) {
           if (newData[i] || newData[String(i)]) {
              const val = newData[i] || newData[String(i)];
              currentData[i] = typeof val === 'object' ? JSON.stringify(val) : String(val);
              updateStepData(i, currentData[i]);
              lastSuccessStep = i;
           }
        }
        currentStart = currentEnd + 1;
      }
      
      clearInterval(visualTimer);
      setCurrentStep(1);
      setEditedContent(currentDocText || currentData[1] || "");
      toast.success("全自動生成完成！");

      // 3. 呼叫 Vercel API 將結果寫入 Notion
      fetch("/api/notion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme, stepsData: currentData }),
      }).then(() => toast.success("已自動備份至 Notion！")).catch(console.error);

    } catch (err: any) {
      clearInterval(visualTimer);
      toast.error("全自動生成失敗: " + err.message);
    } finally {
      clearInterval(visualTimer);
      setIsAutoGenerating(false);
      setAutoProgress(0);
    }
  };\n`;
code = code.replace(oldStartAutoGenerateRegex, newStartAutoGenerate);

// 4. Modify UI to include history sidebar button and panel
const buttonInsertion = '<Button variant="ghost" onClick={() => startAutoGenerate()}';
const newButtonInsertion = `
          <Button variant="ghost" onClick={() => setShowHistory(true)} className="text-white/70 hover:text-white">
             <List size={16} className="mr-2"/> Notion 紀錄
          </Button>
          <Button variant="ghost" onClick={() => startAutoGenerate()}
`;
code = code.replace(buttonInsertion, newButtonInsertion);

const renderEnd = '</main>';
const historySidebarRender = `
        {/* Notion History Sidebar */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="absolute top-0 left-0 bottom-0 w-80 bg-stone-900/95 backdrop-blur-xl border-r border-white/20 z-50 p-6 flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  <BookOpen size={18} className="text-amber-400" />
                  Notion 歷史紀錄
                </h3>
                <button onClick={() => setShowHistory(false)} className="text-white/50 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                {historyList.length === 0 ? (
                  <div className="text-white/50 text-sm text-center mt-10">尚無紀錄</div>
                ) : (
                  historyList.map(item => (
                    <button
                      key={item.id}
                      onClick={() => loadHistoryItem(item.id)}
                      disabled={isLoadingHistory}
                      className="w-full text-left p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition group"
                    >
                      <div className="text-white font-medium text-sm line-clamp-2 group-hover:text-amber-400">{item.title}</div>
                      <div className="text-white/40 text-xs mt-2">{new Date(item.createdAt).toLocaleString()}</div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
`;
code = code.replace(renderEnd, historySidebarRender);

fs.writeFileSync('src/components/Workspace.tsx', code);
console.log('Successfully patched Workspace.tsx');
