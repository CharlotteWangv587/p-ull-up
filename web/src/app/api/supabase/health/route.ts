import { NextResponse } from "next/server";
import { supabasePublic } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabasePublic.rpc("ping");

  if (error) {
    return NextResponse.json(
      { ok: false, error: { message: error.message, code: error.code } },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, ping: data });
}
