import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 },
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const prompt = `You are a work activity parser. A user will describe what they did at work in casual, unstructured text. Your job is to extract individual tasks from it.

For each task, return:
- "task": a short task name (2-6 words, title case)
- "description": a clear one-sentence description of what was done
- "category": a category from common work categories like "Development", "Bug Fix", "Code Review", "Meeting", "Planning", "Documentation", "Testing", "Deployment", "Research", "Communication", "Design", "DevOps", "Learning", or create a fitting one if none match
- "duration": estimated time in minutes if mentioned or inferable, otherwise null

Split multiple activities into separate entries. Be smart about context.

Return a JSON array of objects. Example:
[
  {
    "task": "Fix Login Auth Bug",
    "description": "Fixed the authentication bug on the login page that was causing session timeouts.",
    "category": "Bug Fix",
    "duration": 120
  }
]

User input:
"""
${text}
"""`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);

    return NextResponse.json({ entries: parsed });
  } catch (error) {
    console.error("Parse error:", error);
    return NextResponse.json(
      { error: "Failed to parse input" },
      { status: 500 },
    );
  }
}