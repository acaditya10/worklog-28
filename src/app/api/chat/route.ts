import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { prompt, entries } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const entriesText = (entries || [])
      .map(
        (e: any) =>
          `- [${e.category}] ${e.task}: ${e.description} (${
            e.duration || 0
          } min) — ${new Date(e.createdAt).toLocaleDateString()}`
      )
      .join("\n");

    const fullPrompt = `You are an intelligent AI assistant built into a work logging application called "Worklog". You are chatting with the user to help them analyze their work. Answer the user's question based strictly on the provided work entries. Be professional, concise, and helpful. Format your response cleanly using markdown if needed.

User Question: ${prompt}

Recent Work Entries Context:
${entriesText || "No entries found."}
`;

    const result = await model.generateContent(fullPrompt);
    const text = result.response.text();

    return NextResponse.json({ reply: text });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Failed to process chat query" },
      { status: 500 }
    );
  }
}
