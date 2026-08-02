import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@/lib/supabase/server";
import { getErrorMessage } from "@/lib/utils";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let { data: profile } = await supabase
      .from('users')
      .select('name, currency')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile) {
      await supabase.from('users').insert({
        id: user.id,
        email: user.email,
        name: user.email?.split('@')[0] || 'User',
        currency: 'INR'
      });
      profile = { name: user.email?.split('@')[0] || 'User', currency: 'INR' };
    }

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const { data: expenses } = await supabase
      .from('expenses')
      .select('amount')
      .eq('user_id', user.id)
      .gte('date', startOfMonth);

    const totalSpent = expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
    const currency = profile?.currency || "INR";
    const nameStr = profile?.name ? `The user's name is ${profile.name}. Greet them by name.` : `You do not know the user's name. Greet them with a friendly "Hi there!". Do NOT use placeholders like [username].`;

    const prompt = `You are HabitCoach, a practical money coach.
Write a short greeting (1-2 sentences).
${nameStr}
This month they have spent ${totalSpent} ${currency}.
Use the currency code ${currency} for any money amounts. Do not use $ unless currency is USD.
Do not ask how you can help. Keep the tone calm and useful.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "system", content: prompt }],
      max_tokens: 64,
      temperature: 0.7,
    });

    const displayName = profile?.name || "there";
    let greeting = completion.choices[0]?.message?.content || `Hey ${displayName}! Ready to master your finances today?`;
    
    greeting = greeting.replace(/,?\s*\[username\]/gi, '').replace(/,?\s*\[name\]/gi, '');

    return NextResponse.json({ greeting });

  } catch (error: unknown) {
    console.error("Groq Greeting Error:", getErrorMessage(error));
    return NextResponse.json({ 
      greeting: "Hello again! I noticed you saved slightly more than last week. Have any questions about your budget or want to set a new goal today?" 
    });
  }
}
