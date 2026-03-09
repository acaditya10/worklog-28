import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { entries, type } = await req.json();

    if (!entries || entries.length === 0) {
      return NextResponse.json(
        { error: "No entries to summarize" },
        { status: 400 },
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
    });

    const periodLabel = {
      day: "today",
      week: "this week",
      month: "this month",
      all: "all time",
    }[type as string];

    const entriesText = entries
      .map(
        (e: {
          task: string;
          description: string;
          category: string;
          duration: number | null;
          createdAt: string;
        }) =>
          `- [${e.category}] ${e.task}: ${e.description}${e.duration ? ` (${e.duration} min)` : ""}${e.createdAt ? ` — ${e.createdAt}` : ""}`,
      )
      .join("\n");

    const prompt = `You are a professional work report generator. Given the following work entries from ${periodLabel}, generate a polished, professional status report summary.

The summary must include:

## Key Accomplishments
Highlight the most impactful work done.

## Work Breakdown
Categorize work done by area/category with brief details.

## Time Analysis
If time data is available, provide a breakdown of how time was spent. If not, skip this section.

## Patterns & Observations
${type === "day" ? "Note the flow of the day and any focus areas." : "Identify recurring themes, growth areas, and trends over the period."}

Use professional, concise language suitable for sharing with a manager or team lead. 
FORMATTING INSTRUCTIONS: Use markdown formatting with headers, bullet points, and bold text for emphasis. 
CRITICAL: You MUST include empty lines between EVERY header, paragraph, and list item. The output should not look cramped.

Work entries:
${entriesText}`;

    const result = await model.generateContent(prompt);
    const content = result.response.text();

    return NextResponse.json({ content });
  } catch (error) {
    console.error("Summarize error:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 },
    );
  }
}