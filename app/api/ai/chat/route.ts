import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import type { ChatCompletionMessageParam, ChatCompletionTool } from "groq-sdk/resources/chat/completions";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getErrorMessage } from "@/lib/utils";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const tools: ChatCompletionTool[] = [
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

function parseAmount(val: unknown) {
  return parseFloat(String(val).replace(/[^0-9.-]+/g, "")) || 0;
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Fetch user profile for currency — use maybeSingle() to avoid throwing when no row
    let { data: profile } = await supabase
      .from('users')
      .select('currency')
      .eq('id', user.id)
      .maybeSingle();

    // Create profile row if missing (needed for FK on expenses/goals)
    if (!profile) {
      await supabase.from('users').insert({
        id: user.id,
        email: user.email,
        name: user.email?.split('@')[0] || 'User',
        currency: 'INR'
      });
      profile = { currency: 'INR' };
    }

    const currency = profile?.currency || "INR";

    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    const today = new Date().toISOString();

    const systemPrompt: ChatCompletionMessageParam = {
      role: "system",
      content: `You are HabitCoach, a calm and practical money coach.
Help the user understand spending and reach savings goals. Be concise and useful, never judgmental.
Today's date is ${today}.
Preferred currency: ${currency}. Use that code when talking about money.
You can log expenses and create goals with tools.
If the user wants to log an expense (even just an amount like "log 350"), call log_expense right away. Guess category/merchant if missing, or use "Unknown".
After using a tool, briefly confirm what you did.`
    };

    const chatHistory: ChatCompletionMessageParam[] = [systemPrompt, ...messages];
    let finalResponse = "";

    // Allow up to 3 recursive calls for tool processing
    for (let i = 0; i < 3; i++) {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: chatHistory,
        tools,
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
              revalidatePath('/expenses');
              revalidatePath('/dashboard');
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
              revalidatePath('/goals');
              revalidatePath('/dashboard');
            } else {
              toolResult = "Unknown tool.";
            }
          } catch (e: unknown) {
            console.error(`Tool execution error for ${functionName}:`, getErrorMessage(e));
            toolResult = `Failed to execute ${functionName}: ${getErrorMessage(e)}`;
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

  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    console.error("Groq Chat Error:", err?.status, err?.message);

    if (err?.status === 429) {
      return NextResponse.json({
        error: "⏳ I'm a bit busy right now. Please wait a moment and try again!"
      }, { status: 200 });
    }

    return NextResponse.json({
      error: "❌ Something went wrong. Please try again."
    }, { status: 200 });
  }
}
