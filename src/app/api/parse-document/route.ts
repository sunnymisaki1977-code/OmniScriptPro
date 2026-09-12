import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
// @ts-ignore
import mammoth from "mammoth";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS(req: Request) {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const clientApiKey = formData.get("apiKey") as string;
    
    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400, headers: corsHeaders });
    }

    const apiKey = clientApiKey || process.env.GEMINI_API_KEY || "";
    if (!apiKey) {
      return NextResponse.json({ error: "Missing Gemini API Key" }, { status: 400, headers: corsHeaders });
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);

    const buffer = Buffer.from(await file.arrayBuffer());
    let rawText = "";
    
    // 如果是 PDF，我們直接把 PDF 的 base64 送給 Gemini 處理
    let isPDF = false;
    let pdfBase64 = "";

    if (file.name.toLowerCase().endsWith(".pdf")) {
      isPDF = true;
      pdfBase64 = buffer.toString("base64");
    } else if (file.name.toLowerCase().endsWith(".docx")) {
      const docxData = await mammoth.extractRawText({ buffer });
      rawText = docxData.value;
    } else if (file.name.toLowerCase().endsWith(".txt") || file.name.toLowerCase().endsWith(".md") || file.name.toLowerCase().endsWith(".csv")) {
      rawText = buffer.toString("utf8");
    } else {
      return NextResponse.json({ error: "Unsupported file format" }, { status: 400, headers: corsHeaders });
    }

    if (!isPDF && (!rawText || rawText.trim().length === 0)) {
      return NextResponse.json({ error: "無法從檔案中提取出文字。" }, { status: 400, headers: corsHeaders });
    }

    // 將資料送給 Gemini 進行濃縮與核心萃取
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.3,
      },
    });

    const promptText = `你是一個專業的內容萃取與資料整理專家。
使用者上傳了一份參考文件，請你對提供的內容進行「AI解析與內容擷取」：
1. 提取出文章中的【核心知識、關鍵數據、重要引言與背景資訊】。
2. 刪除無意義的贅字、版權聲明、目錄或空白排版。
3. 如果原文內容很長，請將其濃縮為結構化的重點摘要（使用條列式或小標題）。
4. 最終輸出的字數請盡量控制在 3000 字以內，以確保後續能作為優質的背景知識庫。
5. 若原文本身已非常精簡（少於500字），請直接優化排版後保留原意輸出即可。

請開始解析。`;

    let aiRes;
    
    if (isPDF) {
       // PDF 直接傳送給 Gemini
       aiRes = await model.generateContent([
         promptText,
         {
           inlineData: {
             data: pdfBase64,
             mimeType: "application/pdf"
           }
         }
       ]);
    } else {
       // 文字文件
       const truncatedText = rawText.substring(0, 100000); // 避免超過 token 限制
       aiRes = await model.generateContent([
         promptText,
         `\n\n【原始文件內容】：\n${truncatedText}`
       ]);
    }

    const extractedText = aiRes.response.text().trim();

    return NextResponse.json({ 
      success: true, 
      text: extractedText,
      originalLength: isPDF ? 0 : rawText.length,
      extractedLength: extractedText.length
    }, { headers: corsHeaders });

  } catch (error: any) {
    console.error("Parse Document API Error:", error);
    return NextResponse.json({ error: error.message || "解析失敗" }, { status: 500, headers: corsHeaders });
  }
}
