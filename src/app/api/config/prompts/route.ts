import { getWorkflowSteps } from "@/utils/promptConfigs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { audienceTheme, theme } = await req.json();
   const WORKFLOW_STEPS = getWorkflowSteps({ 
  audienceTheme: audienceTheme || 'heritage', 
  theme 
});
    // 將每個 step 的 function 轉換為字串傳給前端
   export function getWorkflowSteps({ audienceTheme, theme }: { audienceTheme: string; theme: string }) {
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
