import { NextResponse } from 'next/server';
import { AUDIENCE_THEMES, THEME_STEPS } from '@/utils/themeConfig';
import { FEEDBACK_CONFIG } from '@/utils/feedbackConfig';
import { APPLICATION_CONFIG } from '@/utils/applicationConfig';
import { getWorkflowSteps } from "@/utils/promptConfigs";
import { AUDIENCE_STYLES, POPULAR_STYLES } from "@/utils/styleConfigs";

export async function GET() {
  return NextResponse.json({
    AUDIENCE_THEMES,
    THEME_STEPS,
    FEEDBACK_CONFIG,
    APPLICATION_CONFIG,
    AUDIENCE_STYLES,
    POPULAR_STYLES
  });
}

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

    // 回傳 configs 與 prompt (相容舊版寫法)
    return NextResponse.json({ configs: promptConfigs, prompt: promptConfigs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
