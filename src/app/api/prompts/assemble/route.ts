import { WORKFLOW_STEPS } from "@/utils/promptConfigs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { theme, customDocText, startFromStep = 1, endStep = 10, existingData = {} } = body;

    if (!theme) {
      return NextResponse.json({ error: "缺少主題 (theme)" }, { status: 400 });
    }

    const verifiedContext = customDocText || "";

    // 1. 篩選出本次請求需要生成的步驟
    const targetSteps = WORKFLOW_STEPS.filter(step => step.id >= startFromStep && step.id <= endStep);
    if (targetSteps.length === 0) {
      return NextResponse.json({ error: "無效的步驟範圍" }, { status: 400 });
    }

    const keysRequired = targetSteps.map(step => `"${step.id}"`);

    // 2. 建立大師級「自我參考」與「史料」上下文
    const stepContext = {
      theme: theme,
      step1: verifiedContext ? verifiedContext : "【請基於你在 Step 1 產出的內容】",
      step2: existingData[2] || "【請基於你在 Step 2 產出的內容】",
      step3: existingData[3] || "【請基於你在 Step 3 產出的內容】",
      step4: existingData[4] || "【請基於你在 Step 4 產出的內容】",
      step5: existingData[5] || "【請基於你在 Step 5 產出的內容】",
    };

    // 3. 組裝 Master Prompt
    let masterPrompt = `你現在是頂尖的全域企劃 AI 助理。請針對主題「${theme}」產出指定步驟的內容。\n`;

    if (verifiedContext) {
      masterPrompt += `\n【⚠️ 絕對真實性指令】：以下是經過專家查核的「基礎背景文獻」，所有產出必須 100% 遵守此文獻，禁止腦補。\n---\n${verifiedContext}\n---\n`;
    }

    if (startFromStep > 1 && Object.keys(existingData).length > 0) {
      masterPrompt += `\n【⚠️ 上下文參考】：以下是之前已經產出的內容，請作為後續步驟的連貫依據。\n---\n${JSON.stringify(existingData, null, 2)}\n---\n`;
    }

    masterPrompt += `
【絕對要求】：
1. 你必須直接回傳純 JSON 格式，絕對不要包含 markdown 區塊標記 (如 \`\`\`json)。
2. 本次只需輸出 ${targetSteps.length} 個 key：${keysRequired.join(", ")}。
3. 如果該步驟有指定要用 markdown (例如縮圖設計)，請把 markdown 字串塞在對應 key 的 value 中。
`;

    // 4. 動態組合目標步驟的細節要求
    targetSteps.forEach(step => {
      masterPrompt += `
====================
任務 ID: "${step.id}" (${step.title})
要求說明：
${step.prompt(stepContext)}
====================
`;
    });

    masterPrompt += `\n請嚴格回傳一個完整的 JSON 物件：\n{\n`;
    targetSteps.forEach((step, index) => {
      masterPrompt += `  "${step.id}": "該步驟生成的內容字串"` + (index < targetSteps.length - 1 ? ",\n" : "\n");
    });
    masterPrompt += `}`;

    return NextResponse.json({ prompt: masterPrompt, verifiedContext: verifiedContext });
  } catch (error: any) {
    console.error("Prompt Assembly Error:", error);
    return NextResponse.json({ error: error.message || "Prompt組裝失敗" }, { status: 500 });
  }
}
