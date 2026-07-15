import { NextResponse } from 'next/server';
import { AUDIENCE_THEMES, THEME_STEPS } from '@/utils/themeConfig';
import { FEEDBACK_CONFIG } from '@/utils/feedbackConfig';
import { APPLICATION_CONFIG } from '@/utils/applicationConfig';
import { getWorkflowSteps } from "@/utils/promptConfigs";

export async function GET() {
  return NextResponse.json({
    AUDIENCE_THEMES,
    THEME_STEPS,
    FEEDBACK_CONFIG,
    APPLICATION_CONFIG
  });
}


