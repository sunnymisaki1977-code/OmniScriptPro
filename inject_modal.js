const fs = require('fs');

try {
  let modalCode = fs.readFileSync('src/components/FeedbackModal.tsx', 'utf8');

  // Extract component
  const componentStart = modalCode.indexOf('export default function FeedbackModal');
  let componentBody = modalCode.slice(componentStart);
  componentBody = componentBody.replace('export default function FeedbackModal', 'function FeedbackModal');
  
  // Safely remove trackEvent calls using exact strings
  componentBody = componentBody.replace("trackEvent('submit_feedback_started', { theme: currentTheme });", "");
  componentBody = componentBody.replace("trackEvent('submit_feedback_success', { theme: currentTheme });", "");
  componentBody = componentBody.replace("trackEvent('submit_feedback_error', { theme: currentTheme, error: String(error) });", "");
  componentBody = componentBody.replace("trackEvent('open_feedback_modal');", "");

  let targetCode = fs.readFileSync('CanvaApp.js/OmniScript PRO_os.tsx', 'utf8');

  // 1. Add imports to lucide-react if missing
  if (!targetCode.includes(', PenLine,')) {
      targetCode = targetCode.replace(/\} from 'lucide-react';/, ', PenLine, Loader2, Star } from \'lucide-react\';');
  }

  // 2. Inject component body before App()
  if (!targetCode.includes('function FeedbackModal')) {
    targetCode = targetCode.replace('export default function App() {', componentBody + '\n\nexport default function App() {');
  }

  // 3. Inject `<FeedbackModal currentTheme={theme} />` before `{showApiKeyModal && (`
  if (!targetCode.includes('<FeedbackModal currentTheme={theme} />')) {
    targetCode = targetCode.replace('{showApiKeyModal && (', '<FeedbackModal currentTheme={theme} />\n      {showApiKeyModal && (');
  }

  fs.writeFileSync('CanvaApp.js/OmniScript PRO_os.tsx', targetCode);
  console.log("Integration successful!");
} catch (e) {
  console.error("Error:", e);
}
