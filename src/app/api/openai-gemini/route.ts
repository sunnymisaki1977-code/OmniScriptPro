import { NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client with Gemini's base URL and API key
const openai = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY || "GEMINI_API_KEY",
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { messages, model } = body;

        // Default to what the user requested if not provided in request body
        const requestedModel = model || "gemini-3.5-flash";
        const requestedMessages = messages || [
            {   
                role: "system",
                content: "You are a helpful assistant." 
            },
            {
                role: "user",
                content: "Explain to me how AI works",
            },
        ];

        const response = await openai.chat.completions.create({
            model: requestedModel,
            messages: requestedMessages,
        });

        console.log(response.choices[0].message);

        // Return the full message object as well as the text for convenience
        return NextResponse.json({ 
            message: response.choices[0].message,
            text: response.choices[0].message.content 
        });

    } catch (error: any) {
        console.error("OpenAI Gemini API Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate content using OpenAI SDK" }, 
            { status: 500 }
        );
    }
}
