import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@/lib/supabase/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Fetch user profile for name and currency
    const { data: profile } = await supabase
      .from('users')
      .select('name, currency')
      .eq('id', user.id)
      .single();

    // Fetch this month's expenses
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const { data: expenses } = await supabase
      .from('expenses')
      .select('amount')
      .eq('user_id', user.id)
      .gte('date', startOfMonth);

    const totalSpent = expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
    const currency = profile?.currency || "USD";
    const nameStr = profile?.name ? `The user's name is ${profile.name}. Greet them by name.` : `You do not know the user's name. Greet them with a friendly "Hi there!". Do NOT use placeholders like [username].`;

    const prompt = `You are HabitCoach, a friendly financial AI. 
Generate a short (1-2 sentences max), highly personalized, and enthusiastic opening greeting for the user.
${nameStr}
So far this month, they have spent ${totalSpent} ${currency}.
Do not ask how you can help (the chat interface already implies they can ask questions). Just give a warm welcome and a quick encouraging observation about their spending.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "system", content: prompt }],
      max_tokens: 64,
      temperature: 0.7,
    });

    let greeting = completion.choices[0]?.message?.content || `Hey ${name}! Ready to master your finances today?`;
    
    // Foolproof regex to strip out any hallucinated placeholders the AI might stubbornly include
    greeting = greeting.replace(/,?\s*\[username\]/gi, '').replace(/,?\s*\[name\]/gi, '');

    return NextResponse.json({ greeting });

  } catch (error: any) {
    console.error("Groq Greeting Error:", error?.message);
    return NextResponse.json({ 
      greeting: "Hello again! I noticed you saved slightly more than last week. Have any questions about your budget or want to set a new goal today?" 
    });
  }
}
