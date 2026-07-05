// src/utils/analytics.ts
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  // 目前先使用 console.log 模擬追蹤，保留未來接入 PostHog 或 Google Analytics 的彈性
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Analytics] Event: ${eventName}`, properties);
  }
  // TODO: 之後在這裡加入 posthog.capture(eventName, properties)
};
