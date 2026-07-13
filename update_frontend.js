const fs = require('fs');
let code = fs.readFileSync('CanvaApp.js/OmniScript PRO_os.tsx', 'utf8');

// 1. Add state for configs
if (!code.includes('const [formConfigs, setFormConfigs] = useState(null);')) {
  code = code.replace(
    'const [isParsingVisuals, setIsParsingVisuals] = useState(false);',
    'const [isParsingVisuals, setIsParsingVisuals] = useState(false);\n  const [formConfigs, setFormConfigs] = useState(null);'
  );
}

// 2. Update fetch config to store form configs
if (!code.includes('setFormConfigs(')) {
  code = code.replace(
    'setThemeSteps(data.THEME_STEPS);',
    'setThemeSteps(data.THEME_STEPS);\n        if (data.FEEDBACK_CONFIG) setFormConfigs({ feedback: data.FEEDBACK_CONFIG, application: data.APPLICATION_CONFIG });'
  );
}

// 3. Update Modal usages
code = code.replace(
  '{isGlobalMaster ? <FeedbackModal currentTheme={theme} /> : <ApplicationModal />}',
  '{isGlobalMaster ? <FeedbackModal currentTheme={theme} config={formConfigs?.feedback} /> : <ApplicationModal config={formConfigs?.application} />}'
);

// 4. Update FeedbackModal signature
code = code.replace(
  'function FeedbackModal({ currentTheme = \'General\' }: FeedbackModalProps) {',
  'function FeedbackModal({ currentTheme = \'General\', config }) {'
);
code = code.replace(
  'function FeedbackModal({ currentTheme = \'General\' }) {',
  'function FeedbackModal({ currentTheme = \'General\', config }) {'
);

// 5. Replace FeedbackModal arrays with config defaults
code = code.replace(/const q1Options = \[[^\]]*\];/g, 'const q1Options = config?.audienceOptions || [];');
code = code.replace(/const q2Options = \[[^\]]*\];/g, 'const q2Options = config?.usageOptions || [];');
code = code.replace(/const designOptions = \[[^\]]*\];/g, 'const designOptions = config?.designOptions || [];');

// 6. Update ApplicationModal signature
code = code.replace(
  'function ApplicationModal() {',
  'function ApplicationModal({ config }) {'
);

// 7. Replace ApplicationModal arrays with config defaults
code = code.replace(/const platformOptions = \[[^\]]*\];/g, 'const platformOptions = config?.platformOptions || [];');
code = code.replace(/const painPointOptions = \[[^\]]*\];/g, 'const painPointOptions = config?.painPointOptions || [];');
code = code.replace(/const aiToolOptions = \[[^\]]*\];/g, 'const aiToolOptions = config?.aiToolOptions || [];');
code = code.replace(/const apiKeyOptions = \[[^\]]*\];/g, 'const apiKeyOptions = config?.apiKeyOptions || [];');

fs.writeFileSync('CanvaApp.js/OmniScript PRO_os.tsx', code);
console.log('Update complete!');
