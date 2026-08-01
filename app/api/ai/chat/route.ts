import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@/lib/supabase/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    await supabase.auth.getUser();

    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are HabitCoach, a friendly, professional AI financial habit coach.
You help users understand their spending, build healthier habits, and achieve financial goals.
Do not judge them. Be supportive, concise, and give actionable advice.`
        },
        { role: "user", content: message }
      ],
      max_tokens: 512,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || "I didn't quite get that. Could you rephrase?";
    return NextResponse.json({ success: true, reply });

  } catch (error: any) {
    console.error("Groq Chat Error:", error?.status, error?.message);

    if (error?.status === 429) {
      return NextResponse.json({
        error: "⏳ I'm a bit busy right now. Please wait a moment and try again!"
      }, { status: 200 });
    }

    return NextResponse.json({
      error: "❌ Something went wrong. Please try again."
    }, { status: 200 });
  }
}
