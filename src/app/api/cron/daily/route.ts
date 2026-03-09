import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getEntries, saveSummary, getSummaryId } from "@/lib/firebase";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function GET(req: Request) {
  // Verify cron secret to ensure only Vercel can call this endpoint
  const authHeader = req.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Calculate "yesterday"
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const start = new Date(yesterday);
    start.setHours(0, 0, 0, 0);

    const end = new Date(yesterday);
    end.setHours(23, 59, 59, 999);

    // 2. Fetch entries for yesterday
    const entries = await getEntries(start, end);

    if (!entries || entries.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No entries to summarize for yesterday.",
      });
    }

    // 3. Generate summary
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
    });

    const entriesText = entries
      .map(
        (e) =>
          `- [${e.category}] ${e.task}: ${e.description}${
            e.duration ? ` (${e.duration} min)` : ""
          }${e.createdAt ? ` — ${e.createdAt.toISOString()}` : ""}`,
      )
      .join("\n");

    const prompt = `You are a professional work report generator. Given the following work entries from yesterday, generate a polished, professional status report summary.

The summary must include:

## Key Accomplishments
Highlight the most impactful work done.

## Work Breakdown
Categorize work done by area/category with brief details.

## Time Analysis
If time data is available, provide a breakdown of how time was spent. If not, skip this section.

## Patterns & Observations
Note the flow of the day and any focus areas.

Use professional, concise language suitable for sharing with a manager or team lead. 
FORMATTING INSTRUCTIONS: Use markdown formatting with headers, bullet points, and bold text for emphasis. 
CRITICAL: You MUST include empty lines between EVERY header, paragraph, and list item. The output should not look cramped.

Work entries:
${entriesText}`;

    const result = await model.generateContent(prompt);
    const content = result.response.text();

    // 4. Save to Firebase using the ID for yesterday
    await saveSummary("day", content, start, end);

    return NextResponse.json({
      success: true,
      message: `Successfully generated and saved summary for ${entries.length} entries.`,
    });
  } catch (error) {
    console.error("Cron summarize error:", error);
    return NextResponse.json(
      { error: "Failed to run daily daily cron" },
      { status: 500 },
    );
  }
}
