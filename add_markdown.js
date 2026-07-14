const fs = require('fs');
let code = fs.readFileSync('CanvaApp.js/OmniScript PRO_os.tsx', 'utf8');

// 1. Add import
if (!code.includes("import ReactMarkdown")) {
    code = code.replace("import { \n", "import ReactMarkdown from 'react-markdown';\nimport { \n");
}

// 2. Add Eye and PenLine imports to lucide-react if they don't exist
// Actually they are already imported in the existing file! 
// Let's check: "Eye", "PenLine" are already there in the import list.

// 3. Add isPreviewMode state
if (!code.includes("const [isPreviewMode, setIsPreviewMode] = useState(true);")) {
    code = code.replace(
        "const [isVisualSidebarHidden, setIsVisualSidebarHidden] = useState(true);",
        "const [isVisualSidebarHidden, setIsVisualSidebarHidden] = useState(true);\n  const [isPreviewMode, setIsPreviewMode] = useState(true);"
    );
}

// 4. Add the toggle button to the header
const headerTarget = `                    )}
                    <div className="text-[10px] text-slate-500 font-medium">`;
const headerReplacement = `                    )}
                    <button
                      onClick={() => setIsPreviewMode(!isPreviewMode)}
                      className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-800/50 hover:bg-slate-700 transition-all border border-slate-700 hover:border-slate-500 cursor-pointer shadow-sm"
                      title={isPreviewMode ? "切換至編輯模式" : "切換至預覽模式"}
                    >
                      {isPreviewMode ? <PenLine className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      {isPreviewMode ? '編輯' : '預覽'}
                    </button>
                    <div className="text-[10px] text-slate-500 font-medium">`;
code = code.replace(headerTarget, headerReplacement);

// 5. Replace textarea with conditional render and custom CSS
const textareaTarget = `                ) : (
                  /* 生成完畢後，顯示原本的文字編輯器 */
                  <textarea
                    value={stepContents[activeStep]}
                    onChange={(e) => setStepContents(prev => ({ ...prev, [activeStep]: e.target.value }))}
                    className="absolute inset-0 p-6 font-mono text-sm text-slate-300 focus:outline-none overflow-y-auto whitespace-pre-wrap leading-relaxed select-text cursor-text bg-transparent resize-none border-none w-full h-full custom-scrollbar"
                  />
                )}`;

const textareaReplacement = `                ) : (
                  /* 生成完畢後，根據模式顯示預覽或編輯器 */
                  isPreviewMode ? (
                    <div className="absolute inset-0 p-6 overflow-y-auto w-full h-full custom-scrollbar markdown-preview">
                      <ReactMarkdown>{stepContents[activeStep]}</ReactMarkdown>
                    </div>
                  ) : (
                    <textarea
                      value={stepContents[activeStep]}
                      onChange={(e) => setStepContents(prev => ({ ...prev, [activeStep]: e.target.value }))}
                      className="absolute inset-0 p-6 font-mono text-sm text-slate-300 focus:outline-none overflow-y-auto whitespace-pre-wrap leading-relaxed select-text cursor-text bg-transparent resize-none border-none w-full h-full custom-scrollbar"
                    />
                  )
                )}`;
code = code.replace(textareaTarget, textareaReplacement);

// 6. Add markdown custom CSS to the root layout or directly inside OmniScript PRO_os.tsx
// Since we don't have tailwind typography, we can inject a <style> block in the component return.
const styleBlock = `
      <style dangerouslySetInnerHTML={{__html: \`
        .markdown-preview {
          font-family: 'Noto Sans TC', sans-serif;
          color: #cbd5e1;
          line-height: 1.8;
          font-size: 0.9rem;
        }
        .markdown-preview h1, .markdown-preview h2, .markdown-preview h3, .markdown-preview h4 {
          color: #f8fafc;
          font-weight: 700;
          margin-top: 1.5em;
          margin-bottom: 0.75em;
        }
        .markdown-preview h1 { font-size: 1.5rem; border-bottom: 1px solid #334155; padding-bottom: 0.3em; }
        .markdown-preview h2 { font-size: 1.3rem; border-bottom: 1px solid #334155; padding-bottom: 0.3em; }
        .markdown-preview h3 { font-size: 1.1rem; }
        .markdown-preview p { margin-bottom: 1em; }
        .markdown-preview ul, .markdown-preview ol { padding-left: 1.5em; margin-bottom: 1em; }
        .markdown-preview ul { list-style-type: disc; }
        .markdown-preview ol { list-style-type: decimal; }
        .markdown-preview li { margin-bottom: 0.5em; }
        .markdown-preview strong { color: #f1f5f9; font-weight: 700; }
        .markdown-preview em { color: #94a3b8; font-style: italic; }
        .markdown-preview blockquote { border-left: 4px solid #6366f1; padding-left: 1em; color: #94a3b8; margin: 1em 0; background: rgba(99,102,241,0.1); padding: 0.5em 1em; border-radius: 4px; }
        .markdown-preview code { background-color: #1e293b; padding: 0.2em 0.4em; border-radius: 0.25em; font-family: monospace; font-size: 0.85em; color: #818cf8; }
        .markdown-preview pre { background-color: #0f172a; padding: 1em; border-radius: 0.5em; overflow-x: auto; border: 1px solid #1e293b; margin-bottom: 1em; }
        .markdown-preview pre code { background-color: transparent; padding: 0; color: #e2e8f0; }
        .markdown-preview a { color: #818cf8; text-decoration: underline; text-underline-offset: 2px; }
        .markdown-preview hr { border-color: #334155; margin: 2em 0; }
      \`}} />
`;
const styleTarget = `<div className="flex h-screen bg-[#030712] text-slate-100 font-sans overflow-hidden selection:bg-indigo-500/30">`;
if (!code.includes("markdown-preview")) {
   code = code.replace(styleTarget, styleTarget + styleBlock);
}

fs.writeFileSync('CanvaApp.js/OmniScript PRO_os.tsx', code);
console.log('Update complete!');
