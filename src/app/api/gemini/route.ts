import { getWorkflowSteps } from "@/utils/promptConfigs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { audienceTheme } = await req.json();
    const WORKFLOW_STEPS = getWorkflowSteps(audienceTheme || 'heritage');
    
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
