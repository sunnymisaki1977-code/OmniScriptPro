const fs = require('fs');

let code = fs.readFileSync('CanvaApp.js/OmniScript PRO_os.tsx', 'utf8');
const styleContent = fs.readFileSync('src/utils/styleConfigs.ts', 'utf8');

if (!code.includes('export const AUDIENCE_STYLES')) {
  code = code.replace('export default function App() {', styleContent + '\nexport default function App() {');
}

if (!code.includes('const [currentImageStyle, setCurrentImageStyle]')) {
  code = code.replace('const [visualStep, setVisualStep] = useState(6);', 'const [visualStep, setVisualStep] = useState(6);\n  const [currentImageStyle, setCurrentImageStyle] = useState(AUDIENCE_STYLES[\'heritage\']);\n  useEffect(() => { if (AUDIENCE_STYLES[audienceTheme]) { setCurrentImageStyle(AUDIENCE_STYLES[audienceTheme]); } }, [audienceTheme]);');
}

if (!code.includes('const finalPromptWithStyle = prompt + (currentImageStyle ? currentImageStyle.promptSuffix : "");')) {
  code = code.replace('let flashPrompt = prompt;', 'const finalPromptWithStyle = prompt + (currentImageStyle ? currentImageStyle.promptSuffix : "");\n\n        let flashPrompt = finalPromptWithStyle;');
  code = code.replace('instances: [{ prompt: prompt }]', 'instances: [{ prompt: finalPromptWithStyle }]');
}

const lines = code.split('\n');
let start = -1;
let end = -1;
for(let i=0; i<lines.length; i++) {
  if (lines[i].includes('<label className="text-[10px] text-slate-500 font-bold block mb-1">影音縮圖</label>')) {
    start = i - 1;
  }
  if (lines[i].includes('[\'霓虹電競\', \'寫實極簡\', \'3D 賽博\', \'手繪動漫\']')) {
    end = i + 9;
    break;
  }
}

if (start !== -1 && end !== -1) {
  const newUI = `                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-1">畫風濾鏡</label>
                          <select 
                            value={currentImageStyle.id}
                            onChange={(e) => {
                              const selectedId = e.target.value;
                              const recommendedStyle = AUDIENCE_STYLES[audienceTheme];
                              if (recommendedStyle && recommendedStyle.id === selectedId) {
                                setCurrentImageStyle(recommendedStyle);
                                return;
                              }
                              const foundPopular = POPULAR_STYLES.find(s => s.id === selectedId);
                              if (foundPopular) setCurrentImageStyle(foundPopular);
                            }}
                            className="w-full bg-[#070b16] border border-slate-950 rounded-lg px-2 py-1.5 text-[11px] text-slate-300 focus:outline-none mb-3"
                          >
                            {AUDIENCE_STYLES[audienceTheme] && (
                              <optgroup label="💡 受眾專屬推薦風格">
                                <option value={AUDIENCE_STYLES[audienceTheme].id}>
                                  ✨ {AUDIENCE_STYLES[audienceTheme].name} (預設推薦)
                                </option>
                              </optgroup>
                            )}
                            <optgroup label="🔥 流行與其他風格">
                              {POPULAR_STYLES.map((style) => (
                                <option key={style.id} value={style.id}>
                                  {style.name}
                                </option>
                              ))}
                            </optgroup>
                          </select>
                          <div className="text-[9px] text-slate-500/80 mt-1 leading-relaxed italic">
                            已套用風格詞綴：{currentImageStyle.promptSuffix.slice(0, 45)}...
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-1 mt-3">輸出比例</label>
                          <select 
                            value={visualStep}
                            onChange={(e) => setVisualStep(Number(e.target.value))}
                            className="w-full bg-[#070b16] border border-slate-950 rounded-lg px-2 py-1.5 text-[11px] text-slate-300 focus:outline-none mb-3"
                          >
                            <option value={6}>{STEPS.find(s => s.id === 6)?.aspectRatio || '16:9'} - {STEPS.find(s => s.id === 6)?.name || '橫幅縮圖 (YouTube / FB)'}</option>
                            <option value={7}>{STEPS.find(s => s.id === 7)?.aspectRatio || '9:16'} - {STEPS.find(s => s.id === 7)?.name || '短片直式封面 (Shorts / Reels)'}</option>
                            <option value={8}>{STEPS.find(s => s.id === 8)?.aspectRatio || '16:9'} - {STEPS.find(s => s.id === 8)?.name || '意象圖 / 海報'}</option>
                            <option value={10}>{STEPS.find(s => s.id === 10)?.aspectRatio || '1:1 / 4:3'} - {STEPS.find(s => s.id === 10)?.name || '社群推播 / 視覺素材'}</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-1">影像生成引擎</label>
                          <select 
                            value={imageEngine}
                            onChange={(e) => setImageEngine(e.target.value)}
                            className="w-full bg-[#070b16] border border-slate-950 rounded-lg px-2 py-1.5 text-[11px] text-slate-300 focus:outline-none"
                          >
                            {IMAGE_ENGINES.map(engine => (
                              <option key={engine.id} value={engine.id}>{engine.name}</option>
                            ))}
                          </select>
                          <p className="text-[9px] text-slate-500/80 mt-1.5 leading-relaxed">
                            {IMAGE_ENGINES.find(e => e.id === imageEngine)?.desc}
                          </p>
                        </div>`;
  lines.splice(start, end - start + 1, newUI);
  fs.writeFileSync('CanvaApp.js/OmniScript PRO_os.tsx', lines.join('\n'));
  console.log('Successfully updated UI by line numbers.');
} else {
  console.log('Could not find start/end indices.');
}
