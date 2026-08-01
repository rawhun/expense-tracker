import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { currency } = await req.json();
    if (!currency) return NextResponse.json({ error: "Currency is required" }, { status: 400 });

    const { error } = await supabase
      .from('users')
      .upsert({ id: user.id, currency, email: user.email })
      .eq('id', user.id);

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Preferences update error:", error);
    return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 });
  }
}
