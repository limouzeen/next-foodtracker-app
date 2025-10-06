"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// รูป Welcome
import welcomeLogin from "../images/welcome-login.png";

export default function LoginPage() {
  const router = useRouter();
  const sb = supabase();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function getErrMsg(e: unknown): string {
    if (e instanceof Error) {
      // map ข้อความยอดฮิตจาก Supabase
      if (/Invalid login credentials/i.test(e.message)) {
        return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
      }
      return e.message;
    }
    if (typeof e === "string") return e;
    return "เกิดข้อผิดพลาดระหว่างเข้าสู่ระบบ";
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setErr(null);
      setLoading(true);

      // อย่า trim password — เคารพรหัสที่ผู้ใช้ตั้ง
      const emailToUse = email.trim();

      // 1) ล็อกอินด้วยอีเมล/รหัสผ่าน
      const { data: signInData, error: signInErr } =
        await sb.auth.signInWithPassword({
          email: emailToUse,
          password, // no trim
        });
      if (signInErr) throw signInErr;

      const user = signInData.user;
      if (!user) throw new Error("ไม่พบผู้ใช้หลังเข้าสู่ระบบ");

      // 2) กันพลาด: สร้าง/อัปเดตแถวใน user_tb ให้มีเสมอ
      await sb
  .from("user_tb")
  .upsert(
    {
      id: user.id,
      email: user.email ?? null,
      
    },
    { onConflict: "id", ignoreDuplicates: true } //  แค่ insert ถ้ายังไม่มี
  );
      // 3) ไปหน้า Dashboard
      router.replace("/dashboard");
      // เผื่อฝั่ง server มีการอ่าน session
      router.refresh();
    } catch (e: unknown) {
      setErr(getErrMsg(e));
      console.error("Login error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-300 via-fuchsia-300 to-pink-300">
      <main className="mx-auto flex max-w-xl flex-col gap-6 px-6 py-10">
        {/* Back to Home */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-slate-800 shadow-sm backdrop-blur transition hover:scale-[1.02] hover:bg-white"
          >
            <span className="inline-block -ml-1">←</span> Back to Home
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-3xl bg-white/80 p-6 shadow-2xl ring-1 ring-white/40 backdrop-blur">
          {/* Welcome Image */}
          <div className="relative mx-auto mb-6 h-40 w-40 overflow-hidden rounded-2xl shadow-xl ring-2 ring-white/50">
            <Image
              src={welcomeLogin}
              alt="Welcome illustration"
              fill
              sizes="10rem" // ✅ แก้ warning ของ Next/Image เมื่อใช้ fill
              className="object-cover transition-transform duration-500 hover:scale-105"
              priority
            />
          </div>

          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
              Welcome Back
            </h1>
            <p className="mt-2 text-sm text-neutral-600">
              Log in to continue your Food Tracker
            </p>
          </div>

          {/* Error */}
          {err && (
            <p className="mb-4 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700">
              {err}
            </p>
          )}

          {/* Form */}
          <form
            onSubmit={onSubmit}
            className="space-y-5"
            autoComplete="off" // ✅ กัน browser autofill รหัสเก่า
          >
            {/* Email */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800">
                อีเมล
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30"
                autoComplete="username"     // ✅ ช่วย browser รู้ว่าเป็นอีเมล
                name="login-email"          // ✅ เปลี่ยน name กัน reuse autofill เก่า
                inputMode="email"
                spellCheck={false}
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800">
                รหัสผ่าน
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 pr-28 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30"
                  autoComplete="current-password" // ✅ ชี้ชัดว่าเป็นรหัสปัจจุบัน
                  name="login-password-current"   // ✅ กัน autofill รหัสเก่าทับ
                  spellCheck={false}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-white/80 px-3 py-1 text-xs font-medium text-slate-700 shadow hover:bg-white"
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 px-5 py-3 text-base font-semibold text-white shadow-lg transition-transform hover:scale-[1.01] hover:from-pink-600 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300/50 disabled:opacity-50"
            >
              {loading ? "กำลังเข้าสู่ระบบ..." : "Login"}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-6 text-center text-sm">
            <p className="text-neutral-700">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text font-semibold text-transparent underline-offset-4 hover:underline"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>

        {/* Copyright */}
        <footer className="mt-6 rounded-2xl border border-white/30 bg-gradient-to-r from-white/10 via-white/5 to-white/10 py-4 text-center backdrop-blur">
          <p className="text-xs font-light tracking-wider text-white/80">
            © {new Date().getFullYear()}{" "}
            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text font-semibold text-transparent">
              Amarat
            </span>{" "}
            · All Rights Reserved
          </p>
        </footer>
      </main>
    </div>
  );
}
