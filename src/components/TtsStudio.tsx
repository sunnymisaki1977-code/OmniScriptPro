'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  Play,
  Pause,
  Square,
  PenLine,
  Download,
  Sliders,
  FileCode,
  Filter,
  GraduationCap,
  BookOpen,
  Eraser,
  Key,
  Eye,
  EyeOff,
  Trash2,
  Sparkles,
  Loader2,
  FileText,
  Zap,
  CheckCircle2,
  Radio
} from 'lucide-react';

interface TtsStudioProps {
  step2Content?: string;
  step4Content?: string;
  geminiApiKey?: string;
  addLog?: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

const UPWARD_MOBILITY_STORY = `第一章：2026 翻身密碼與社會基因

欸，你有沒有發現，今天是 2026 年 11 月 2 號了。在這個 AI 代理人幫你處理掉所有雜事的時代，你是不是反而感到一種莫名的空虛？好像努力工作、績效達標，卻還是擠不進某些神祕的「高端圈子」。

想像一下，你剛參加完一場 AI 精準媒合的沙龍。你的設備最頂級、筆記最快，但當話題從算力轉向某個小眾藝術季的哲學時，你突然覺得自己像個誤入舞會的局外人。那種「我不屬於這裡」的刺痛，你懂嗎？

為什麼有些人明明沒你努力，卻能輕易獲得大佬的信任？在微認證時代，學歷漸漸失效了，取而代之的是那種說不清楚的「氣場」與「格調」。難道我們注定被出身困住嗎？這就是今天要聊的主題。

別焦慮，這不是你「不夠好」，而是你還沒看懂規則。德國溝通專家朵莉絲．馬爾汀在《向上流動》這本書裡說：出身是牌，但「慣習」才是翻轉命運的槓桿。現在，讓我們一起來破解這套「社會基因」代碼。

第二章：解密「慣習」——從生存導向到膠囊慣習

「慣習」聽起來很玄，其實就是你的「社會基因」。它包括你的言談舉止、對事物的品味，甚至是你面對壓力的直覺反應。這不是教你假裝有錢，而是要從內而外改寫你的行為手冊。

首先，我們要戒掉「生存導向型慣習」。別再整天問「這有什麼用？」買東西只看 CP 值、社交只看利弊，這種「太過用力」的姿態，反而曝露了你對未來的焦慮和底層的匱乏感。

作者說：「向上流動本身就是奢侈的縮影。」這句話很美，它代表你開始追求「超出生存必要」的事物。生存是只要有梯子爬就好，但向上流動是追求那一座充滿設計感的轉角，展現你的想像力。

你不需要唸貴族學校，但你可以打造「膠囊慣習」。在談吐和禮儀上做精準的微調。就像給你的社交系統裝了一個「模擬器」，讓你在不同階層的圈子都能流暢運行，而不必更換整台主機。

第三章：七大資本槓桿與慣習增肌

在 2026 年，金錢只是七大資本中最淺的一種。你還有知識、社會、文化、語言、身體與心理資本。真正的翻身高手，懂得用手上的「優勢資本」去換取那些錢買不到的「稀缺資本」。

就像在現在的職涯裡，你的「微認證」是知識資本，你的「AI 協作能力」是心理資本。這些都是能撬開大門的萬能鑰匙。階層躍升不在於你中沒中娘胎樂透，而在於你怎麼整合資源。

如果你進到新環境覺得忐忑、覺得自己像個騙子，恭喜你！這就是「冒牌者症候群」。這種不安代表你正在重塑大腦的邊界。肌肉酸痛代表訓練到位，心理酸痛代表你的慣習正在增肌。

翻身之路不會像週日散步那樣輕鬆。它會對你提出嚴苛的要求，挑戰你的習慣。但記住作者說的：每一步不適，都在拓展你的邊界。你現在的每一步辛苦，都是在改寫命運的代碼。

第四章：眼界的解封——你是人生的工程師

我們以前以為，只要加班、考證照，財富自由後就能被圈子接納。但事實是：在 2026 年，技術價值在遞減。真正的隱形門檻，是你的文化品味與情緒韌性。沒格局的人，錢再多也是暴發戶。

如果你的行為模式依然停留在「怕吃虧、求穩定、重實用」，那你依然會被上層視為缺乏格局。向上流動，是眼界的解封，而不僅僅是存款的增加。你必須學會用更寬廣的視角看世界。

真正的轉變是從你看世界的方式開始的。當你不再只關注眼前的利益，開始關注更宏大的議題，比如哲學、美學或人類的未來，那種由內而外散發出的「格局」，才是你最強大的資本。

所以，把你的「慣習」當成一套可以優化的代碼吧。你可以有意識地微調它，刪除那些限制你的舊邏輯，植入能讓你走得更遠的新思維。這場遊戲，現在才真正開始。

第五章：高層晚宴實戰推演——三大破冰心法

好，現在我們來實戰推演。想像你獲邀參加一場高層晚餐，主題是 2027 年的產業佈局。你坐在這群大佬中間，感覺自己快窒息了，社交節奏完全掌握不住。該怎麼辦？

第一招：調整你的「語言資本」。開口前，先停頓一秒。避免過度使用那些網路流行語或死板的技術術語。記住作者說的：「語言的節制，就是地位的象徵。」精確、洗鍊地表達你的觀點。

第二招：啟動「觀察模式」。別急著表現自己或討好別人。觀察那些「原生高階人士」如何處理歧見、如何低調地展現慷慨。模仿他們那種「非生存導向」的反應，比如對失敗的雲淡風輕。

第三招：今晚回家後，關掉那些焦慮的成功學 Podcast。改看一場關於當代建築或環境哲學的紀錄片。建立這種「不帶目的性」的文化資本，它會成為你下次社交時最強大的破冰船。

為什麼要看這些專門「沒用的」東西？因為在高端圈子，大家聊的不是怎麼賺錢，而是怎麼「生活」。當你能對策展邏輯或哲學辯論發表見解時，那道隱形的階層牆壁，就會自動為你打開。

這套練習剛開始會很彆扭，這很正常。你的舊慣習會把你往回拉，讓你覺得自己「假惺惺」。但這不是虛偽，而是進化。就像練肌肉一樣，你正在給你的社交靈魂進行負重訓練。

堅持下去。慢慢地，你會發現自己不再需要刻意停頓，那些精確的詞彙會自然流露。你會發現，你開始能平視那些曾經讓你仰望的人，因為你的內在代碼已經完成了升級。

第六章：奪回人生主導權——21 個上位策略的藍圖

2026 年的機會，從不屬於墨守成規的人。它屬於那些敢於重新設計自己、敢於想像更美好未來的探險家。你已經走得很遠了，現在只需要稍微調整一下羅盤的方向，指向那個更好的自己。

你要記住，向上流動不是為了炫耀，而是為了獲得更廣闊的自由。當你的慣習不再被匱乏感驅動，你才真正擁有了選擇人生的權利。格局，才是決定你最後能走多遠的關鍵。

這本書提到的 21 個策略，其實都是在教我們如何奪回人生的主導權。不要被出身和資源限制，要學會主導你發出的每一個訊號。你是你人生的建築師，慣習就是你的藍圖。

翻身之路雖然辛苦，但每一步都在拓展你的邊界。那些你曾經覺得遙不可及的世界，其實只要你願意改變「慣習」，大門一直都為你敞開著。別害怕那種不適感，那是成長的聲音。

好，實戰推演結束。現在，你準備好要開始這場「社會基因」的重塑手術了嗎？別等明天，從你下一句開口說的話、下一個買的東西開始改變。未來的你，正在終點等你。

第七章：終章——破繭而出，優雅地向上流動

幫你總結一下：第一，慣習是代碼，可以透過微調重寫；第二，別只存錢，要存品味、存人脈、存心靈資本；第三，學會投入「超出必要」的努力去追求美好。這就是向上流動的真諦。

親愛的朋友，如果你在翻身的路上感到孤單、忐忑，請記得：你現在的不適感，正是你正在破繭而出的聲音。你已經走得很遠了，現在只需要再堅持一下下，讓新的慣習長成你的盔甲。

在你的生活裡，有沒有哪個瞬間讓你深刻感受到「階層的隱形牆」？是一個聽不懂的冷笑話，還是對金錢不同的看法？歡迎在評論區跟我分享你的故事，我們一起拆解背後的邏輯。

這本《向上流動》不只是一本書，它是你打破天花板的指南。記得訂閱、分享給那個也在努力翻身的朋友。我是你的翻身戰友，2026 年，讓我們一起優雅地，向上流動。`;

const TRADITIONAL_STORY = `列位看官，且慢移步！
今日咱們不說三國紛爭，也不講大唐盛世，我要帶各位回一趟那古意盎然、雲霧繚繞的泉州府南安縣。在那詩山之巔，有一位神祇，他身披蟒袍、腳踏雲靴，卻生了一張俊朗如少年的紅臉，最特別的是他那尊像，一隻腳盤著，一隻腳卻隨意垂下——這位，便是大名鼎鼎、以孝聞名的「保安廣澤尊王」，咱民間親切地喊他一聲「聖王公」。

但您可知道，這位威震八方的戰神，成神之路可不只是砍妖除魔？他最驚心動魄的一戰，竟然是跟自家的「老丈人」動了手，還引發了一場驚動天地、連「朱、邢、李」三位王爺都捲入其中的鬥法大戲！

【鳳山巔，翁婿戰雲】

話說在那五代後漢時期，南安有個放羊娃名叫郭忠福。這孩子不得了，十六歲那年在郭山古藤下坐化成神，肉身不壞。可成神後的郭聖王，心裡還記掛著凡間的一段情緣。他看中了尤溪陳法師的女兒陳依娘，兩人魂魄相依，最後聖王公乾脆「強龍過江」，在眾目睽睽下把依娘接回了鳳山寺，封為「妙應仙妃」。

這可捅了馬蜂窩了！依娘的父親陳法師，那是當時閩南一帶法力最強的道士，吹一聲哨角能喚雷，揮一下寶劍能斷流。他一聽說自家閨女被一個「木頭神」給拐走了，氣得鬍子都翹到了天上：「好你個郭忠福！我陳某人修煉一生，豈能讓女兒嫁給一尊神像受冷落？」

陳法師背上法劍，帶上法印，殺氣騰騰直奔鳳山寺。他站在山門前，二話不說，從懷裡掏出一隻金色的哨角，深吸一口氣，猛地一吹！`;

// 輔助函式：從文字中擷取 voiceover 並分章節
function extractVoiceoversToChapters(rawContent: string) {
  if (!rawContent || !rawContent.trim()) return null;

  const stripOuterBrackets = (str: string) => {
    return str.trim().replace(/^\[+/, '').replace(/\]+$/, '').trim();
  };

  const scenes: Array<{ voiceover: string; caption: string }> = [];
  const objectBlockRegex = /\{[^{}]*?"voiceover"\s*:\s*"((?:[^"\\]|\\.)*)"[^{}]*?\}/g;
  let match;
  while ((match = objectBlockRegex.exec(rawContent)) !== null) {
    const block = match[0];
    const rawVo = match[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
    const capMatch = block.match(/"caption"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    let cleanCap = "";
    if (capMatch) {
      cleanCap = stripOuterBrackets(capMatch[1].replace(/\\"/g, '"'));
      if (cleanCap.includes('/')) {
        cleanCap = cleanCap.split('/')[0].trim();
      }
    }
    const cleanVo = stripOuterBrackets(rawVo);
    if (cleanVo) {
      scenes.push({ voiceover: cleanVo, caption: cleanCap });
    }
  }

  if (scenes.length === 0) {
    const voRegex = /['"]voiceover['"]\s*:\s*['"]((?:[^'"\\]|\\.)*)['"]/g;
    while ((match = voRegex.exec(rawContent)) !== null) {
      const cleanVo = stripOuterBrackets(match[1]);
      if (cleanVo) {
        scenes.push({ voiceover: cleanVo, caption: "" });
      }
    }
  }

  if (scenes.length === 0) return null;

  const SCENES_PER_CHAPTER = 4;
  const chineseNums = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
  const chaptersOutput: string[] = [];

  for (let i = 0; i < scenes.length; i += SCENES_PER_CHAPTER) {
    const group = scenes.slice(i, i + SCENES_PER_CHAPTER);
    const chapterIndex = Math.floor(i / SCENES_PER_CHAPTER);
    const chapterNumStr = chineseNums[chapterIndex] || (chapterIndex + 1);

    const captionsInGroup = group.map(s => s.caption).filter(Boolean);
    let chapterTitle = `第${chapterNumStr}章`;
    if (captionsInGroup.length >= 2) {
      chapterTitle += `：${captionsInGroup[0]}——${captionsInGroup[captionsInGroup.length - 1]}`;
    } else if (captionsInGroup.length === 1) {
      chapterTitle += `：${captionsInGroup[0]}`;
    } else {
      chapterTitle += `：精彩段落 (${i + 1}-${i + group.length})`;
    }

    const paragraphs = group.map(s => s.voiceover).join('\n\n');
    chaptersOutput.push(`${chapterTitle}\n\n${paragraphs}`);
  }

  return {
    text: chaptersOutput.join('\n\n'),
    sceneCount: scenes.length,
    chapterCount: chaptersOutput.length
  };
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function normalizeAndAlignPCM(pcm16: Int16Array, sampleRate: number): Int16Array {
  if (!pcm16 || pcm16.length === 0) return pcm16;

  let sum = 0;
  for (let i = 0; i < pcm16.length; i++) { sum += pcm16[i]; }
  const dcOffset = Math.round(sum / pcm16.length);

  const silenceThreshold = 180;
  let startIdx = 0;
  let endIdx = pcm16.length - 1;

  while (startIdx < pcm16.length && Math.abs(pcm16[startIdx] - dcOffset) < silenceThreshold) { startIdx++; }
  while (endIdx > startIdx && Math.abs(pcm16[endIdx] - dcOffset) < silenceThreshold) { endIdx--; }

  const leadSamples = Math.floor(sampleRate * 0.04);
  startIdx = Math.max(0, startIdx - leadSamples);
  const trailSamples = Math.floor(sampleRate * 0.06);
  endIdx = Math.min(pcm16.length - 1, endIdx + trailSamples);

  const activeLength = Math.max(1, endIdx - startIdx + 1);

  let maxPeak = 1;
  for (let i = startIdx; i <= endIdx; i++) {
    const absVal = Math.abs(pcm16[i] - dcOffset);
    if (absVal > maxPeak) maxPeak = absVal;
  }

  const targetPeak = 26000;
  const gain = Math.min(4.5, targetPeak / maxPeak);

  const padTailSamples = Math.floor(sampleRate * 0.35);
  const output = new Int16Array(activeLength + padTailSamples);
  const fadeSamples = Math.min(Math.floor(sampleRate * 0.015), Math.floor(activeLength / 4));

  for (let i = 0; i < activeLength; i++) {
    let sample = (pcm16[startIdx + i] - dcOffset) * gain;
    if (i < fadeSamples) {
      sample *= (i / fadeSamples);
    } else if (i > activeLength - fadeSamples) {
      sample *= ((activeLength - i) / fadeSamples);
    }
    output[i] = Math.max(-32768, Math.min(32767, Math.round(sample)));
  }

  return output;
}

function pcmToWav(pcm16: Int16Array, sampleRate: number): Blob {
  const numChannels = 1;
  const byteRate = sampleRate * numChannels * 2;
  const blockAlign = numChannels * 2;
  const dataSize = pcm16.length * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  const audioData = new Uint8Array(buffer, 44);
  const pcmDataUint8 = new Uint8Array(pcm16.buffer, pcm16.byteOffset, pcm16.byteLength);
  audioData.set(pcmDataUint8);

  return new Blob([buffer], { type: 'audio/wav' });
}

function cleanTextForTTS(text: string): string {
  return text
    .replace(/^[\s]*[#*\->]+[\s]*/, '')
    .replace(/[*_~=`]{2,}/g, '')
    .replace(/[\-]{3,}/g, '')
    .trim();
}

export default function TtsStudio({
  step2Content = '',
  step4Content = '',
  geminiApiKey = '',
  addLog
}: TtsStudioProps) {
  const [storyInput, setStoryInput] = useState<string>(UPWARD_MOBILITY_STORY);
  const [isEditMode, setIsEditMode] = useState<boolean>(true);
  const [globalVoice, setGlobalVoice] = useState<string>('Sadaltager');

  // 一致性優化選項
  const [useDspNorm, setUseDspNorm] = useState<boolean>(true);
  const [useConsistencyLock, setUseConsistencyLock] = useState<boolean>(true);
  const [anchorPrompt, setAnchorPrompt] = useState<string>(
    'Say in a natural Taiwanese Mandarin accent, studio recording, close mic, zero reverb, steady pace and consistent tone: '
  );

  // API Key 狀態
  const [customApiKey, setCustomApiKey] = useState<string>('');
  const [showKeyPassword, setShowKeyPassword] = useState<boolean>(false);

  // 播放與狀態控制
  const [chunks, setChunks] = useState<string[]>([]);
  const [chunkVoices, setChunkVoices] = useState<string[]>([]);
  const [currentPlayIndex, setCurrentPlayIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>('準備就緒');
  const [showWave, setShowWave] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string>('');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [downloadingChunkIndex, setDownloadingChunkIndex] = useState<number | null>(null);

  // 快取佇列
  const audioQueueRef = useRef<Record<number, string>>({});
  const pcmDataQueueRef = useRef<Record<number, Int16Array>>({});
  const fetchPromisesRef = useRef<Record<number, Promise<string | null>>>({});
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const currentSampleRateRef = useRef<number>(24000);
  const isStoppedRef = useRef<boolean>(true);
  const currentFetchIndexRef = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const readContainerRef = useRef<HTMLDivElement | null>(null);

  const PREFETCH_LIMIT = 2;
  const MODEL_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent';

  useEffect(() => {
    const saved = localStorage.getItem('gemini_tts_api_key') || '';
    if (saved) setCustomApiKey(saved);
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    if (addLog) addLog(msg, 'info');
    setTimeout(() => {
      setToastMsg('');
    }, 3500);
  };

  const getActiveKey = () => {
    return (
      customApiKey.trim() ||
      geminiApiKey.trim() ||
      (typeof window !== 'undefined' && (window as any).__GEMINI_API_KEY__ ? (window as any).__GEMINI_API_KEY__ : '')
    );
  };

  const fetchAudioForChunk = (textChunk: string, index: number): Promise<string | null> => {
    const cleanedText = cleanTextForTTS(textChunk);
    if (!cleanedText) return Promise.resolve('empty');

    const existingPromise = fetchPromisesRef.current[index];
    if (existingPromise) return existingPromise;

    const fetchTask = async () => {
      const chunkVoiceName = chunkVoices[index] || globalVoice;
      const finalPromptText = (useConsistencyLock && anchorPrompt)
        ? `${anchorPrompt}${cleanedText}`
        : cleanedText;

      const activeKey = getActiveKey();
      const useProxy = !activeKey;
      const url = useProxy
        ? '/api/gemini-tts'
        : `${MODEL_ENDPOINT}?key=${encodeURIComponent(activeKey)}`;

      const payload = useProxy
        ? { promptText: finalPromptText, voiceName: chunkVoiceName, apiKey: activeKey }
        : {
            contents: [{ parts: [{ text: finalPromptText }] }],
            generationConfig: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: chunkVoiceName } }
              }
            },
            model: 'gemini-2.5-flash-preview-tts'
          };

      try {
        let delay = 2000;
        for (let attempt = 0; attempt < 5; attempt++) {
          if (isStoppedRef.current && !isExporting) {
            delete fetchPromisesRef.current[index];
            return null;
          }

          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(activeKey ? { 'x-goog-api-key': activeKey } : {})
            },
            body: JSON.stringify(payload)
          });

          if (response.ok) {
            const result = await response.json();
            const part = result?.candidates?.[0]?.content?.parts?.[0];
            if (part?.inlineData?.data && part?.inlineData?.mimeType) {
              const rateMatch = part.inlineData.mimeType.match(/rate=(\d+)/);
              const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
              const pcmData = base64ToArrayBuffer(part.inlineData.data);
              let pcm16: any = new Int16Array(pcmData as any);

              if (useDspNorm) {
                pcm16 = normalizeAndAlignPCM(pcm16, sampleRate);
              }

              pcmDataQueueRef.current[index] = pcm16;
              currentSampleRateRef.current = sampleRate;

              const wavBlob = pcmToWav(pcm16, sampleRate);
              return URL.createObjectURL(wavBlob);
            }
            break;
          } else if (response.status === 429) {
            console.warn(`[TTS 429] 頻率限制，等待 ${delay}ms 後重試...`);
            await new Promise((r) => setTimeout(r, delay));
            delay *= 1.5;
          } else if (response.status === 401 || response.status === 403) {
            showToast('⚠️ 偵測到 API 憑證失效 (401/403)，請輸入有效的 Gemini API Key！');
            delete fetchPromisesRef.current[index];
            return 'auth_error';
          } else {
            break;
          }
        }
      } catch (err) {
        console.warn(`[TTS 請求失敗]:`, err);
      }

      delete fetchPromisesRef.current[index];
      return 'error';
    };

    fetchPromisesRef.current[index] = fetchTask();
    return fetchPromisesRef.current[index];
  };

  const prefetchLoop = async () => {
    while (currentFetchIndexRef.current < chunks.length && !isStoppedRef.current) {
      const unplayedCount = Object.keys(audioQueueRef.current).filter(
        (i) => parseInt(i) >= currentPlayIndex
      ).length;
      if (unplayedCount >= PREFETCH_LIMIT) {
        await new Promise((r) => setTimeout(r, 800));
        continue;
      }

      const fetchIdx = currentFetchIndexRef.current;
      if (!audioQueueRef.current[fetchIdx]) {
        if (currentPlayIndex === 0 && fetchIdx === 0) {
          setStatusText('正在生成開場語音，請稍候...');
          setShowWave(true);
        }

        const url = await fetchAudioForChunk(chunks[fetchIdx], fetchIdx);
        if (url === 'auth_error') {
          stopStory();
          break;
        }
        if (!isStoppedRef.current && url) {
          audioQueueRef.current[fetchIdx] = url;
          if (fetchIdx === currentPlayIndex && !isPlaying) {
            playNextChunk(fetchIdx);
          }
        }
      }
      if (currentFetchIndexRef.current === fetchIdx) {
        currentFetchIndexRef.current++;
      }
    }
  };

  const playNextChunk = (targetIdx?: number) => {
    if (isStoppedRef.current) return;
    const playIdx = targetIdx !== undefined ? targetIdx : currentPlayIndex;

    if (playIdx >= chunks.length) {
      stopStory();
      setStatusText('故事朗讀完畢！');
      setShowWave(false);
      showToast('🎉 故事朗讀完畢！');
      return;
    }

    const url = audioQueueRef.current[playIdx];
    if (!url) {
      setStatusText(`正在緩衝第 ${playIdx + 1}/${chunks.length} 段語音...`);
      setShowWave(true);
      return;
    }
    if (url === 'empty' || url === 'error') {
      if (url === 'error') showToast(`第 ${playIdx + 1} 段音檔生成失敗，自動跳過`);
      setCurrentPlayIndex(playIdx + 1);
      playNextChunk(playIdx + 1);
      return;
    }

    setIsPlaying(true);
    setIsPaused(false);
    const activeVoice = chunkVoices[playIdx] || globalVoice;
    setStatusText(`正在朗讀 (第 ${playIdx + 1}/${chunks.length} 段 - ${activeVoice})...`);
    setShowWave(true);

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
    }

    const audio = new Audio(url);
    currentAudioRef.current = audio;

    audio.onended = () => {
      const nextIdx = playIdx + 1;
      setCurrentPlayIndex(nextIdx);
      setIsPlaying(false);
      playNextChunk(nextIdx);
    };

    audio.play().catch(() => {
      showToast('瀏覽器阻擋自動播放，請點擊畫面繼續。');
      pauseStory();
    });

    // 平滑滾動到當前播放的段落
    const el = document.getElementById(`tts-chunk-${playIdx}`);
    if (el && readContainerRef.current) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const prepareStory = () => {
    const rawLines = storyInput.split('\n').map((c) => c.trim()).filter((c) => c.length > 0);
    if (rawLines.length === 0) {
      showToast('請先輸入故事或腳本內容！');
      return false;
    }

    const newChunks: string[] = [];
    let current = '';
    const TARGET_LENGTH = 500;

    rawLines.forEach((line, index) => {
      const isTitle = (line.length < 28 && !/[。！？]/.test(line)) || (line.includes('第') && line.includes('章'));
      if (isTitle) {
        if (current) {
          newChunks.push(current);
          current = '';
        }
        newChunks.push(line);
      } else {
        current += (current ? '\n\n' : '') + line;
        if (current.length >= TARGET_LENGTH || index === rawLines.length - 1) {
          newChunks.push(current);
          current = '';
        }
      }
    });

    if (current) newChunks.push(current);

    setChunks(newChunks);
    setChunkVoices(newChunks.map(() => globalVoice));
    return true;
  };

  const startStory = (startIndex = 0) => {
    if (chunks.length === 0 || isEditMode) {
      if (!prepareStory()) return;
    }
    setIsEditMode(false);
    isStoppedRef.current = false;
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentPlayIndex(startIndex);

    if (startIndex === 0) {
      audioQueueRef.current = {};
      pcmDataQueueRef.current = {};
      fetchPromisesRef.current = {};
      currentFetchIndexRef.current = 0;
    } else {
      currentFetchIndexRef.current = startIndex;
    }

    prefetchLoop();
    playNextChunk(startIndex);
  };

  const pauseStory = () => {
    if (currentAudioRef.current && !currentAudioRef.current.paused) {
      currentAudioRef.current.pause();
      setIsPlaying(false);
      setIsPaused(true);
      setStatusText('已暫停');
      setShowWave(false);
    } else if (currentAudioRef.current && currentAudioRef.current.paused) {
      currentAudioRef.current.play();
      setIsPlaying(true);
      setIsPaused(false);
      setStatusText(`正在朗讀 (第 ${currentPlayIndex + 1}/${chunks.length} 段)...`);
      setShowWave(true);
    }
  };

  const stopStory = () => {
    isStoppedRef.current = true;
    setIsPlaying(false);
    setIsPaused(false);
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    setStatusText('準備就緒');
    setShowWave(false);
  };

  const jumpToChunk = (index: number) => {
    if (isStoppedRef.current) {
      startStory(index);
    } else {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      setCurrentPlayIndex(index);
      if (!audioQueueRef.current[index]) {
        currentFetchIndexRef.current = index;
        prefetchLoop();
      }
      setIsPlaying(false);
      playNextChunk(index);
    }
  };

  const exportSingleChunk = async (index: number) => {
    setDownloadingChunkIndex(index);
    setIsExporting(true);
    showToast(`正在生成第 ${index + 1} 段音檔...`);
    try {
      if (!pcmDataQueueRef.current[index]) {
        const url = await fetchAudioForChunk(chunks[index], index);
        if (url && url !== 'error' && url !== 'auth_error' && url !== 'empty') {
          audioQueueRef.current[index] = url;
        }
      }
      if (pcmDataQueueRef.current[index]) {
        const wavBlob = pcmToWav(pcmDataQueueRef.current[index], currentSampleRateRef.current);
        const downloadUrl = URL.createObjectURL(wavBlob);
        const voiceName = chunkVoices[index] || globalVoice;
        const titleStr = cleanTextForTTS(chunks[index]).substring(0, 8).replace(/[\\/:*?"<>|]/g, '');
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = downloadUrl;
        a.download = `段落${index + 1}_${voiceName}_${titleStr}.wav`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          URL.revokeObjectURL(downloadUrl);
          document.body.removeChild(a);
        }, 200);
        showToast(`✅ 第 ${index + 1} 段音檔下載成功！`);
      }
    } finally {
      setIsExporting(false);
      setDownloadingChunkIndex(null);
    }
  };

  const exportFullAudio = async () => {
    if (chunks.length === 0 && !prepareStory()) return;

    setIsExporting(true);
    showToast('開始準備合併完整音檔，請稍候...');

    let totalLength = 0;
    let exportSuccess = true;

    try {
      for (let i = 0; i < chunks.length; i++) {
        if (!pcmDataQueueRef.current[i]) {
          setStatusText(`緩衝音檔 (${i + 1}/${chunks.length})...`);
          setShowWave(true);
          const url = await fetchAudioForChunk(chunks[i], i);
          if (url === 'auth_error' || url === 'error' || !url) {
            exportSuccess = false;
            break;
          }
          if (url) audioQueueRef.current[i] = url;
          await new Promise((r) => setTimeout(r, 1200));
        }
        if (pcmDataQueueRef.current[i]) {
          totalLength += pcmDataQueueRef.current[i].length;
        }
      }

      if (!exportSuccess) {
        showToast('部分段落尚未完成，請再次點擊「匯出完整音檔」重試！');
        return;
      }

      setStatusText('正在合併完整音訊段落...');
      await new Promise((r) => setTimeout(r, 60));

      const combinedPcm = new Int16Array(totalLength);
      let offset = 0;
      for (let i = 0; i < chunks.length; i++) {
        if (pcmDataQueueRef.current[i]) {
          combinedPcm.set(pcmDataQueueRef.current[i], offset);
          offset += pcmDataQueueRef.current[i].length;
        }
      }

      const fullWavBlob = pcmToWav(combinedPcm, currentSampleRateRef.current);
      const downloadUrl = URL.createObjectURL(fullWavBlob);
      const uniqueVoices = Array.from(new Set(chunkVoices));
      const voiceTag = uniqueVoices.length > 1 ? '多角色混音' : (uniqueVoices[0] || 'AI說書');
      const titleStr = chunks[0] ? cleanTextForTTS(chunks[0]).substring(0, 10).replace(/[\\/:*?"<>|]/g, '') : '未命名';

      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = downloadUrl;
      a.download = `AI說書人_${voiceTag}_${titleStr}.wav`;
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
      }, 200);
      showToast('🎉 完整音檔下載成功！');
    } catch (e: any) {
      showToast(`合併失敗: ${e.message}`);
    } finally {
      setIsExporting(false);
      setStatusText('準備就緒');
      setShowWave(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      const extracted = extractVoiceoversToChapters(content);
      if (extracted) {
        setStoryInput(extracted.text);
        showToast(`🎉 已從 ${file.name} 擷取 ${extracted.sceneCount} 段旁白並整合成 ${extracted.chapterCount} 章！`);
      } else {
        setStoryInput(content);
        showToast(`已成功讀取文件：${file.name}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-slate-900/60 custom-scrollbar text-stone-200">
      <div className="max-w-5xl mx-auto bg-slate-950/80 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden border border-slate-800">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-stone-900 to-slate-900 p-5 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-amber-400">
              <Volume2 className="w-8 h-8 text-amber-500 animate-pulse" />
              TTS 語音發控中心 · AI 說書人
            </h1>
            <p className="text-stone-400 mt-1 text-xs md:text-sm">
              多角色對話語音合成、日文旁白擷取、全流程 DSP 音量平衡與錄音室環境錨定
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/80 p-2 rounded-xl border border-slate-700/60">
            <label htmlFor="voice-select-main" className="text-xs font-semibold text-stone-300 shrink-0">
              預設全域聲音：
            </label>
            <select
              id="voice-select-main"
              value={globalVoice}
              onChange={(e) => {
                const val = e.target.value;
                setGlobalVoice(val);
                setChunkVoices((prev) => prev.map(() => val));
                audioQueueRef.current = {};
                pcmDataQueueRef.current = {};
                fetchPromisesRef.current = {};
                showToast(`已切換全域聲音為: ${val}`);
              }}
              className="bg-slate-700 text-white text-xs md:text-sm rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer max-w-[260px] md:max-w-xs truncate border border-slate-600"
            >
              <optgroup label="原始推薦設定">
                <option value="Sadaltager">Sadaltager (男)：台灣口語博學且具備專業知識感 (預設)</option>
                <option value="Charon">Charon (男)：台灣口語沉穩低音，資訊傳遞感強</option>
                <option value="Zephyr">Zephyr (女)：輕快、年輕且明亮</option>
                <option value="Aoede">Aoede (女)：溫柔婉約，微歌唱感輕盈起伏</option>
                <option value="Puck">Puck (男)：台灣口語俏皮跳躍，冒險喜劇節奏</option>
                <option value="Kore">Kore (女)：咬字清晰堅定，標準播報女聲</option>
                <option value="Fenrir">Fenrir (男)：熱情激昂爆發力，熱血高能</option>
                <option value="Leda">Leda (女)：年輕活力、親切帶點稚嫩感</option>
                <option value="Gacrux">Gacrux (女)：成熟穩重女聲，歷練豐富</option>
              </optgroup>

              <optgroup label="1. 明亮與活潑 (Bright & Upbeat)">
                <option value="Zephyr">Zephyr (女)：輕快明亮，網紅感十足</option>
                <option value="Puck">Puck (男)：俏皮靈動與跳躍感</option>
                <option value="Leda">Leda (女)：親切、帶點稚嫩感</option>
                <option value="Autonoe">Autonoe (女)：外向活潑、探店打卡開箱</option>
                <option value="Sadachbia">Sadachbia (男)：台灣口語生動、充滿活力</option>
              </optgroup>

              <optgroup label="2. 穩重與專業 (Firm & Informative)">
                <option value="Charon">Charon (男)：沉穩男性低音，適合歷史傳記</option>
                <option value="Kore">Kore (女)：咬字清晰堅定，財經企管首選</option>
                <option value="Iapetus">Iapetus (男)：穩重具權威感，口齒清晰</option>
                <option value="Sadaltager">Sadaltager (男)：博學專業，知識點密集推薦</option>
                <option value="Schedar">Schedar (男)：沉著平穩可靠，大氣厚重</option>
              </optgroup>

              <optgroup label="3. 順暢與隨和 (Smooth & Easygoing)">
                <option value="Callirrhoe">Callirrhoe (女)：流暢自然，知性編輯導讀</option>
                <option value="Despina">Despina (女)：輕鬆友善，拉近聽眾距離</option>
                <option value="Umbriel">Umbriel (男)：溫和柔順隨和</option>
                <option value="Achird">Achird (男)：極具親切感與友好度</option>
                <option value="Zubenelgenubi">Zubenelgenubi (男)：朋友聊天般的隨意輕鬆感</option>
              </optgroup>

              <optgroup label="4. 特色與高表現力 (Expressive & Unique)">
                <option value="Fenrir">Fenrir (男)：熱情爆發力，適合高能大喊破冰</option>
                <option value="Enceladus">Enceladus (男)：溫柔氣音，浪漫小說療癒首選</option>
                <option value="Algenib">Algenib (男)：磁性沙啞嗓音</option>
                <option value="Aoede">Aoede (女)：日系透明感與微歌唱感</option>
                <option value="Gacrux">Gacrux (女)：成熟歷練豐富穩重女聲</option>
              </optgroup>

              <optgroup label="🇯🇵 日文旁白推薦專區">
                <option value="Sadaltager">Sadaltager (男)：知性條理 (サラタメ風)</option>
                <option value="Charon">Charon (男)：低沉磁性 (NHK 歷史紀錄片風)</option>
                <option value="Kore">Kore (女)：咬字極清 (日本女子アナ主播風)</option>
                <option value="Enceladus">Enceladus (男)：溫柔空氣感 (村上春樹獨白風)</option>
                <option value="Leda">Leda (女)：萌系聲線 (日本聲優與 VTuber 氣場)</option>
                <option value="Fenrir">Fenrir (男)：熱血爆發 (少年熱血動漫主角風)</option>
              </optgroup>
            </select>
          </div>
        </div>

        {/* 控制按鈕列 & 狀態儀表 */}
        <div className="border-b border-slate-800 p-4 bg-slate-900/90 flex flex-wrap justify-between items-center gap-4 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex flex-wrap gap-2.5">
            {isEditMode ? (
              <button
                onClick={() => startStory(0)}
                className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white px-5 py-2 rounded-xl font-bold text-xs shadow-lg shadow-amber-600/20 active:scale-95 transition-all flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                開始說書
              </button>
            ) : (
              <>
                <button
                  onClick={pauseStory}
                  className="bg-slate-700 hover:bg-slate-600 text-stone-100 px-4 py-2 rounded-xl font-bold text-xs shadow-sm active:scale-95 transition-all flex items-center gap-2"
                >
                  {isPaused ? <Play className="w-4 h-4 fill-current text-green-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
                  {isPaused ? '繼續' : '暫停'}
                </button>
                <button
                  onClick={stopStory}
                  className="bg-red-900/40 hover:bg-red-900/60 text-red-200 border border-red-800/60 px-4 py-2 rounded-xl font-bold text-xs shadow-sm active:scale-95 transition-all flex items-center gap-2"
                >
                  <Square className="w-4 h-4 text-red-400 fill-current" />
                  停止
                </button>
                <button
                  onClick={() => {
                    stopStory();
                    setIsEditMode(true);
                  }}
                  className="bg-slate-700 hover:bg-slate-600 text-stone-200 px-4 py-2 rounded-xl font-bold text-xs shadow-sm active:scale-95 transition-all flex items-center gap-2"
                >
                  <PenLine className="w-4 h-4 text-amber-400" />
                  修改故事
                </button>
                <button
                  onClick={exportFullAudio}
                  disabled={isExporting}
                  className="bg-blue-600/80 hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-sm active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  匯出完整音檔 (.wav)
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs font-medium text-stone-300">
            {showWave && (
              <div className="flex items-center gap-1 h-6">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className="w-1 bg-amber-400 rounded-full animate-bounce"
                    style={{
                      height: `${12 + (i % 3) * 6}px`,
                      animationDelay: `${i * 150}ms`
                    }}
                  />
                ))}
              </div>
            )}
            <span className="bg-slate-800 px-3 py-1 rounded-full border border-slate-700 font-mono text-amber-300">
              {statusText}
            </span>
          </div>
        </div>

        {/* 聲音一致性與 DSP 錨定設定列 */}
        <div className="border-b border-slate-800/80 px-5 py-3 bg-slate-900/50 flex flex-wrap items-center justify-between gap-4 text-xs text-stone-300">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-bold text-amber-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              段落聲音一致性優化：
            </span>

            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={useDspNorm}
                onChange={(e) => setUseDspNorm(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
              <span>自動音量平衡與氣口對齊 (DSP)</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={useConsistencyLock}
                onChange={(e) => setUseConsistencyLock(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
              <span>鎖定穩定語調與環境</span>
            </label>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label htmlFor="anchor-select-main" className="text-stone-400 shrink-0">
              環境錨定：
            </label>
            <select
              id="anchor-select-main"
              value={anchorPrompt}
              onChange={(e) => setAnchorPrompt(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-stone-200 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="Say in a natural Taiwanese Mandarin accent, studio recording, close mic, zero reverb, steady pace and consistent tone: ">
                🇹🇼 台灣口音錄音室（自然穩定・無空間回音）
              </option>
              <option value="Say in natural native Japanese (Tokyo standard accent), studio recording, close mic, zero reverb, steady pace and consistent tone: ">
                🇯🇵 日文母語錄音室（東京標準腔・無回音穩定）
              </option>
              <option value="Say in a clear studio recording with close mic, zero reverb, steady pace, and consistent pitch and tone: ">
                🎙️ 專業錄音室乾聲（無回音・語速音調穩定）
              </option>
              <option value="Say as a warm, calm audiobook narrator with steady pacing, consistent volume, close mic, and zero reverb: ">
                📖 沉穩有聲書旁白（溫暖平穩・前後一致）
              </option>
              <option value="Say as an upbeat short video narrator with crisp pronunciation, fast and steady pace, close mic, and zero reverb: ">
                ⚡ 短影音俐落播報（咬字清晰・節奏緊湊一致）
              </option>
              <option value="">不附加環境錨定詞（維持原文本）</option>
            </select>
          </div>
        </div>

        {/* API 金鑰設定列 */}
        <div className="border-b border-slate-800 px-5 py-2 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <Key className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-stone-300 font-medium">Gemini API Key（選填）：</span>
            <span className="text-stone-500 hidden md:inline">
              若未輸入將自動使用系統金鑰池代為生成，輸入時支援直連加速
            </span>
          </div>

          <div className="flex items-center gap-2 flex-grow sm:flex-grow-0 max-w-md w-full sm:w-auto">
            <input
              type={showKeyPassword ? 'text' : 'password'}
              value={customApiKey}
              onChange={(e) => {
                const val = e.target.value;
                setCustomApiKey(val);
                localStorage.setItem('gemini_tts_api_key', val);
              }}
              placeholder="預設使用伺服器金鑰池，或貼上個人 AIzaSy... 金鑰"
              className="bg-slate-900 border border-slate-700 text-stone-200 text-xs rounded-lg px-3 py-1.5 outline-none focus:border-amber-500 flex-grow min-w-[220px]"
            />
            <button
              onClick={() => setShowKeyPassword(!showKeyPassword)}
              type="button"
              className="text-stone-400 hover:text-stone-200 p-1.5 rounded"
              title="顯示/隱藏金鑰"
            >
              {showKeyPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => {
                setCustomApiKey('');
                localStorage.removeItem('gemini_tts_api_key');
                showToast('已清除自訂金鑰，恢復為系統伺服器金鑰池');
              }}
              type="button"
              className="text-stone-400 hover:text-red-400 p-1.5 rounded"
              title="清除金鑰"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 主要工作區 */}
        <div className="p-5 md:p-6 min-h-[480px]">
          {isEditMode ? (
            /* 編輯模式 */
            <div className="flex flex-col gap-3">
              {/* 工具欄 */}
              <div className="flex flex-wrap justify-between items-center gap-2">
                <div className="text-xs text-stone-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>支援匯入中文或 .py / .json 剪映腳本，自動擷取旁白成章！</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* 快捷載入 Step 2 / Step 4 */}
                  {step2Content && (
                    <button
                      onClick={() => {
                        setStoryInput(step2Content);
                        showToast('📥 已將 Step 2 長影音腳本載入 TTS 編輯區！');
                      }}
                      className="bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 border border-blue-800/60 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-400" />
                      載入 Step 2 腳本
                    </button>
                  )}
                  {step4Content && (
                    <button
                      onClick={() => {
                        setStoryInput(step4Content);
                        showToast('📥 已將 Step 4 短影音腳本載入 TTS 編輯區！');
                      }}
                      className="bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-800/60 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      載入 Step 4 腳本
                    </button>
                  )}

                  <label className="bg-slate-800 hover:bg-slate-700 text-stone-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-sm">
                    <FileCode className="w-3.5 h-3.5 text-amber-400" />
                    讀取文件 (擷取旁白)
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt,.py,.json,.md"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={() => {
                      const extracted = extractVoiceoversToChapters(storyInput);
                      if (extracted) {
                        setStoryInput(extracted.text);
                        showToast(`✨ 成功擷取 ${extracted.sceneCount} 段旁白，並編排為 ${extracted.chapterCount} 個章節！`);
                      } else {
                        showToast('未在文字中偵測到 voiceover 腳本結構，已保留原文字。');
                      }
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-stone-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1"
                  >
                    <Filter className="w-3.5 h-3.5 text-amber-400" />
                    擷取框內旁白成章
                  </button>

                  <button
                    onClick={() => {
                      setStoryInput(UPWARD_MOBILITY_STORY);
                      showToast('已載入《向上流動》七大章節說書稿！');
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-stone-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1"
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                    《向上流動》
                  </button>

                  <button
                    onClick={() => {
                      setStoryInput(TRADITIONAL_STORY);
                      showToast('已載入傳統說書範例！');
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-stone-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    說書範例
                  </button>

                  <button
                    onClick={() => {
                      setStoryInput('');
                      showToast('已清空內容。');
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-stone-400 hover:text-red-400 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1"
                  >
                    <Eraser className="w-3.5 h-3.5" />
                    清空
                  </button>
                </div>
              </div>

              {/* 文字輸入框 */}
              <textarea
                value={storyInput}
                onChange={(e) => setStoryInput(e.target.value)}
                placeholder="請在此貼上故事內容，或點擊上方「載入 Step 2 / Step 4 腳本」，系統會自動擷取旁白並編排成章..."
                className="w-full min-h-[420px] p-4 bg-slate-900/90 border border-slate-700 rounded-xl text-stone-100 text-sm md:text-base leading-relaxed focus:border-amber-500 focus:outline-none transition-all resize-y font-serif custom-scrollbar"
              />
            </div>
          ) : (
            /* 播放/閱讀模式 */
            <div
              ref={readContainerRef}
              className="w-full h-[540px] overflow-y-auto px-2 md:px-4 py-2 custom-scrollbar flex flex-col gap-4"
            >
              {chunks.map((text, index) => {
                const isCurrent = currentPlayIndex === index && !isStoppedRef.current;
                const isTitleChunk =
                  (text.length < 28 && !/[。！？]/.test(text)) ||
                  (text.includes('第') && text.includes('章'));

                return (
                  <div
                    key={index}
                    id={`tts-chunk-${index}`}
                    onClick={() => jumpToChunk(index)}
                    className={`p-4 rounded-xl relative group transition-all duration-300 border cursor-pointer ${
                      isCurrent
                        ? 'bg-amber-950/30 border-amber-500/80 shadow-lg shadow-amber-500/10 scale-[1.01]'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* 段落頭部選單 */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-800 text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold px-2 py-0.5 rounded-full ${
                            isCurrent
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-800 text-stone-400'
                          }`}
                        >
                          段落 {index + 1}
                        </span>

                        {/* 每段獨立聲音選擇器（多角色對話） */}
                        <select
                          value={chunkVoices[index] || globalVoice}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            e.stopPropagation();
                            const newVoice = e.target.value;
                            setChunkVoices((prev) => {
                              const updated = [...prev];
                              updated[index] = newVoice;
                              return updated;
                            });
                            delete audioQueueRef.current[index];
                            delete pcmDataQueueRef.current[index];
                            delete fetchPromisesRef.current[index];
                            showToast(`段落 ${index + 1} 已切換為 ${newVoice}`);
                          }}
                          className="bg-slate-800 text-stone-200 border border-slate-700 rounded-md px-2 py-1 text-xs outline-none focus:border-amber-500 cursor-pointer max-w-[220px] truncate"
                        >
                          <option value="Sadaltager">Sadaltager (博學男)</option>
                          <option value="Charon">Charon (沉穩低音男)</option>
                          <option value="Zephyr">Zephyr (輕快明亮女)</option>
                          <option value="Aoede">Aoede (溫柔婉約女)</option>
                          <option value="Puck">Puck (俏皮活潑男)</option>
                          <option value="Kore">Kore (播報清晰女)</option>
                          <option value="Fenrir">Fenrir (熱血爆發男)</option>
                          <option value="Leda">Leda (可愛萌系女)</option>
                          <option value="Enceladus">Enceladus (溫柔氣音男)</option>
                          <option value="Callirrhoe">Callirrhoe (知性女編輯)</option>
                          <option value="Gacrux">Gacrux (成熟歷練女)</option>
                          <option value="Zubenelgenubi">Zubenelgenubi (輕鬆聊天男)</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            jumpToChunk(index);
                          }}
                          className="bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-600/40 px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          朗讀此段
                        </button>
                        <button
                          disabled={downloadingChunkIndex === index}
                          onClick={(e) => {
                            e.stopPropagation();
                            exportSingleChunk(index);
                          }}
                          className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-all ${
                            downloadingChunkIndex === index
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 cursor-wait animate-pulse'
                              : 'bg-slate-800 hover:bg-slate-700 text-stone-300 border border-slate-700'
                          }`}
                        >
                          {downloadingChunkIndex === index ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                              <span>進行中...</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-3 h-3" />
                              <span>下載單段</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* 段落本文 */}
                    <div className="whitespace-pre-wrap leading-relaxed font-serif text-sm md:text-base">
                      {isTitleChunk ? (
                        <h2 className="text-lg md:text-xl font-bold text-amber-400 py-1">
                          {text}
                        </h2>
                      ) : (
                        <p className={isCurrent ? 'text-amber-100 font-medium' : 'text-stone-300'}>
                          {text}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Toast 提示框 */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 bg-slate-800 text-amber-300 border border-amber-500/40 px-5 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-xs md:text-sm font-medium">{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
