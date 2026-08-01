import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@/lib/supabase/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const tools = [
  {
    type: "function",
    function: {
      name: "log_expense",
      description: "Logs a new expense for the user in the database.",
      parameters: {
        type: "object",
        properties: {
          amount: { type: "number", description: "The amount spent in numeric format." },
          merchant: { type: "string", description: "The name of the store, person, or merchant." },
          category: { type: "string", description: "The category of the expense (e.g., Food, Transport, Shopping, Utilities)." },
          notes: { type: "string", description: "Optional notes about the expense." }
        },
        required: ["amount"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_goal",
      description: "Creates a new financial savings goal for the user in the database.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "The title of the goal (e.g., Vacation to Bali, New Laptop)." },
          target_amount: { type: "number", description: "The target amount of money to save in numeric format." }
        },
        required: ["title", "target_amount"]
      }
    }
  }
];

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Fetch user profile for currency
    const { data: profile } = await supabase
      .from('users')
      .select('currency')
      .eq('id', user.id)
      .single();
    const currency = profile?.currency || "USD";

    let { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    const today = new Date().toISOString();

    const systemPrompt = {
      role: "system",
      content: `You are HabitCoach, a friendly, professional AI financial habit coach.
You help users understand their spending, build healthier habits, and achieve financial goals.
Do not judge them. Be supportive, concise, and give actionable advice.
Today's date is ${today}.
The user's preferred currency is ${currency}. Always use this currency symbol/code when discussing money.
You have tools available to log expenses and create goals for the user. 
IMPORTANT: If the user asks to log an expense (even if they only provide an amount, like "log 350"), you MUST call the log_expense tool immediately. Do not ask for clarification first. Guess the category and merchant if missing, or use "Unknown".
If you use a tool, you MUST briefly confirm to the user that it was done successfully in your final response.`
    };

    let chatHistory = [systemPrompt, ...messages];
    let finalResponse = "";

    // Allow up to 3 recursive calls for tool processing
    for (let i = 0; i < 3; i++) {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: chatHistory as any,
        tools: tools as any,
        tool_choice: "auto",
        max_tokens: 512,
        temperature: 0.7,
      });

      const message = completion.choices[0]?.message;
      if (!message) break;

      chatHistory.push(message);

      if (message.tool_calls && message.tool_calls.length > 0) {
        for (const toolCall of message.tool_calls) {
          const functionName = toolCall.function.name;
          const args = JSON.parse(toolCall.function.arguments);
          let toolResult = "";

          try {
            const parseAmount = (val: any) => parseFloat(String(val).replace(/[^0-9.-]+/g, "")) || 0;

            if (functionName === "log_expense") {
              const { error } = await supabase.from('expenses').insert([{
                user_id: user.id,
                amount: parseAmount(args.amount),
                merchant: args.merchant || 'Unknown',
                category: args.category || 'General',
                notes: args.notes || null,
                date: new Date().toISOString(),
                confidence: 1.0,
                is_recurring: false,
                is_impulse: false
              }]);
              if (error) throw error;
              toolResult = `Successfully logged expense: ${args.merchant} for ${args.amount} ${currency}`;
            } else if (functionName === "create_goal") {
              const { error } = await supabase.from('goals').insert([{
                user_id: user.id,
                title: args.title,
                target_amount: parseAmount(args.target_amount),
                current_amount: 0,
                status: 'active'
              }]);
              if (error) throw error;
              toolResult = `Successfully created goal: ${args.title} for ${args.target_amount} ${currency}`;
            } else {
              toolResult = "Unknown tool.";
            }
          } catch (e: any) {
            console.error(`Tool execution error for ${functionName}:`, e.message);
            toolResult = `Failed to execute ${functionName}: ${e.message}`;
          }

          chatHistory.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: toolResult
          });
        }
        // Loop continues to generate the next response after tool results
      } else {
        // No more tool calls, we have our final text response
        finalResponse = message.content || "I've handled that for you!";
        break;
      }
    }

    if (!finalResponse) finalResponse = "I've processed your request!";
    return NextResponse.json({ success: true, reply: finalResponse });

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
