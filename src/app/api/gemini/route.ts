import { getWorkflowSteps } from "@/utils/promptConfigs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 🌟 1. 紀錄前端送過來的資料
    console.log("📥 [API Request] 收到前端送出的主題:", {
      audienceTheme: body.audienceTheme,
      theme: body.theme
    });

    const WORKFLOW_STEPS = getWorkflowSteps(body.audienceTheme || 'heritage');

    // 🌟 2. 紀錄準備回傳給前端的資料
    console.log("📤 [API Response] 成功生成步驟，總數:", WORKFLOW_STEPS.length);
    // 如果資料量不會太大，也可以直接印出整個 JSON 方便線上排查
    // console.log("📤 [API Response Detail]:", JSON.stringify(WORKFLOW_STEPS));
    
    // 將每個 step 的 function 轉換為字串傳給前端
    const promptConfigs = WORKFLOW_STEPS.map(step => ({
      id: step.id,
      title: step.title,
      description: step.description,
      dependsOn: step.dependsOn,
      promptStr: step.prompt.toString() // 關鍵：將 JS function 序列化
    }));

    return NextResponse.json({ prompt: promptConfigs });
  } catch (error: any) {
    console.error("❌ [API Error] 流水線發生錯誤:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
