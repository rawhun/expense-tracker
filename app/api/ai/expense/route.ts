import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@/lib/supabase/server";
import { getErrorMessage } from "@/lib/utils";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { input_text } = await req.json();

    if (!input_text) {
      return NextResponse.json({ error: "No input text provided" }, { status: 400 });
    }

    const today = new Date().toISOString();

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a financial parsing assistant. Extract expense details from the user's natural language input and return ONLY valid JSON with no extra text.
Today's date is ${today}.
Return this exact JSON structure:
{
  "amount": <number>,
  "merchant": <string>,
  "category": <string, e.g. "Food & Drinks", "Transport", "Shopping", "Entertainment", "Health", "Groceries", "Utilities", "Education">,
  "subcategory": <string or null>,
  "payment_method": <string or null, e.g. "Cash", "UPI", "Credit Card">,
  "notes": <string or null>,
  "date": <ISO datetime string>,
  "confidence": <float 0-1>,
  "is_recurring": <boolean>,
  "is_impulse": <boolean>
}`
        },
        { role: "user", content: input_text }
      ],
      response_format: { type: "json_object" },
      max_tokens: 256,
      temperature: 0.1,
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const cleanedRaw = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsedExpense = JSON.parse(cleanedRaw);

    if (!parsedExpense.amount) parsedExpense.amount = 0;
    if (!parsedExpense.merchant) parsedExpense.merchant = "Unknown Merchant";
    parsedExpense.amount = parseFloat(String(parsedExpense.amount).replace(/[^0-9.-]+/g, "")) || 0;
    if (!parsedExpense.date || Number.isNaN(new Date(parsedExpense.date).getTime())) {
      parsedExpense.date = new Date().toISOString();
    }

    return NextResponse.json({ success: true, data: parsedExpense });

  } catch (error: unknown) {
    console.error("Groq Expense Error:", getErrorMessage(error));
    return NextResponse.json({ error: "Failed to parse expense. Please try rephrasing." }, { status: 500 });
  }
}
