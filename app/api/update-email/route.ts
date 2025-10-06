import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ✅ ป้องกันการใช้ any
type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

const supabaseAdmin: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    if (typeof body !== "object" || body === null)
      return NextResponse.json({ error: "invalid body" }, { status: 400 });

    const { userId, newEmail } = body as { userId?: unknown; newEmail?: unknown };

    if (typeof userId !== "string" || typeof newEmail !== "string") {
      return NextResponse.json({ error: "missing or invalid userId/newEmail" }, { status: 400 });
    }

    //  ตรวจรูปแบบอีเมลพื้นฐาน
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json({ error: "invalid email format" }, { status: 400 });
    }

    //  ใช้ admin API เปลี่ยนอีเมลโดยไม่ต้องยืนยัน (ข้าม SMTP)
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      email: newEmail,
      email_confirm: true,
    });

    if (error) {
      console.error("auth.admin.updateUserById error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // sync กับ user_tb (ไม่ต้องเปลี่ยนโครงสร้าง)
    const { error: upErr } = await supabaseAdmin
      .from("user_tb")
      .update({ email: newEmail })
      .eq("id", userId);

    if (upErr) {
      console.error("user_tb update error:", upErr);
      return NextResponse.json({ error: upErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, user: data.user });
  } catch (e: unknown) {
    const msg =
      e instanceof Error ? e.message : typeof e === "string" ? e : "unknown error";
    console.error("update-email API error:", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
