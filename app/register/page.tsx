"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

type Gender = "male" | "female" | "other" | "";

// ใช้รูปโปรไฟล์จากโฟลเดอร์ images
import defaultAvatar from "../images/profile.jpg";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState<Gender>("");
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const router = useRouter();
  const sb = supabase();

  const inputRef = useRef<HTMLInputElement | null>(null);

  const previewUrl = useMemo(() => {
    if (!file) return "";
    return URL.createObjectURL(file);
  }, [file]);

  const onPickImage = () => inputRef.current?.click();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }
    setFile(f);
  };

  //คืนค่านามสกุลไฟล์แบบ lower-case (รองรับ jpg/png/jpeg)
  const getFileExt = (filename: string) => {
    const parts = filename.split(".");
    const ext = parts.length > 1 ? parts.pop()! : "jpg";
    return ext.toLowerCase();
  };

  function getErrorMessage(e: unknown): string {
    if (e instanceof Error) return e.message;
    if (typeof e === "string") return e;
    return "เกิดข้อผิดพลาดระหว่างลงทะเบียน";
  }

const onSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    setErr(null);
    setLoading(true);

    if (!email || !password) {
      setErr('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }

    // signup (ไม่มียืนยันอีเมลแล้ว)
    const { data: signUpData, error: signUpErr } = await sb.auth.signUp({
      email,
      password,
      options: { data: { fullname: fullName, gender } },
    });

    let user = signUpData.user ?? null;
    let session = signUpData.session ?? null;

    // ถ้าบังเอิญเจออีเมลที่สมัครไว้แล้ว → ลองล็อกอินทันที (กันเคส “User already registered”)
    if (signUpErr) {
      const { data: signInData, error: signInErr } = await sb.auth.signInWithPassword({ email, password });
      if (signInErr) throw signUpErr; // รหัสไม่ตรง: คง error เดิม
      user = signInData.user;
      session = signInData.session;
    }

    if (!user || !session) throw new Error('Login session not established');

    await postSignInSync({ id: user.id, email: user.email ?? null });

    router.replace('/dashboard');
  } catch (e: unknown) {
    setErr(e instanceof Error ? e.message : 'เกิดข้อผิดพลาดระหว่างลงทะเบียน');
    console.error('Register error:', e);
  } finally {
    setLoading(false);
  }
};

// เรียกหลังมี session แล้วเท่านั้น
async function postSignInSync(user: { id: string; email: string | null }) {
  // 1) การันตีว่ามีแถวใน user_tb ก่อน (upsert)
  const { error: upsertErr } = await sb
    .from('user_tb')
    .upsert({ id: user.id, email: user.email }, { onConflict: 'id' });
  if (upsertErr) throw upsertErr;

  // 2) อัปเดตชื่อ/เพศ (เช็คว่ามีแถวโดนจริง)
  const { data: upd1, error: updMetaErr } = await sb
    .from('user_tb')
    .update({ fullname: fullName, gender })
    .eq('id', user.id)
    .select('id');
  if (updMetaErr) throw updMetaErr;
  if (!upd1 || upd1.length === 0) throw new Error('อัปเดตชื่อ/เพศไม่สำเร็จ (RLS หรือไม่พบแถว)');

  // 3) ถ้ามีไฟล์ → อัปโหลด + เก็บ URL ที่ใช้ได้จริง
  if (file) {
    const ext = getFileExt(file.name);
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;

    const { error: uploadErr } = await sb.storage.from('user_bk').upload(path, file, { upsert: true });
    if (uploadErr) throw uploadErr;

    // ถ้า bucket เป็น public → ได้ URL เปิดดูได้
    const { data: pub } = sb.storage.from('user_bk').getPublicUrl(path);
    const publicUrl = pub.publicUrl; // ถ้า bucket เป็น private ให้เก็บ 'path' แทน

    const { data: upd2, error: updAvatarErr } = await sb
      .from('user_tb')
      .update({ user_image_url: publicUrl }) // หรือ { user_image_url: path } ถ้า private
      .eq('id', user.id)
      .select('id, user_image_url');
    if (updAvatarErr) throw updAvatarErr;
    if (!upd2 || upd2.length === 0) throw new Error('อัปเดตรูปไม่สำเร็จ (RLS หรือไม่พบแถว)');
  }
}


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
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
              Create your account
            </h1>
            <p className="mt-2 text-sm text-neutral-600">
              Join Food Tracker — Track your meal!!!
            </p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Avatar + Upload */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative h-28 w-28 overflow-hidden rounded-full shadow-lg ring-4 ring-white/60">
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt="Preview avatar"
                    fill
                    className="object-cover"
                    unoptimized
                    priority
                  />
                ) : (
                  <Image
                    src={defaultAvatar}
                    alt="Default avatar"
                    fill
                    className="object-cover"
                    priority
                  />
                )}
              </div>

              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFileChange}
              />

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onPickImage}
                  className="rounded-full bg-gradient-to-r from-pink-500 to-blue-500 px-5 py-2 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white/50"
                >
                  Choose Photo
                </button>
                {file && (
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow hover:bg-white"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="text-xs text-neutral-600">PNG, JPG up to ~5MB</p>
            </div>

            {/* Full Name */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800">
                ชื่อ-สกุล
              </label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="เช่น Amarat K."
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30"
              />
            </div>

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
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800">
                รหัสผ่าน
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800">
                เพศ
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30"
              >
                <option value="">โปรดเลือก</option>
                <option value="male">ชาย</option>
                <option value="female">หญิง</option>
                <option value="other">อื่น ๆ</option>
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 px-5 py-3 text-base font-semibold text-white shadow-lg transition-transform hover:scale-[1.01] hover:from-pink-600 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300/50"
            >
              {loading ? "กำลังลงทะเบียน..." : "ลงทะเบียน"}
            </button>
            {err && <p className="mt-2 text-sm text-red-600">{err}</p>}

          </form>
          

          {/* Footer links */}
          <div className="mt-6 text-center text-sm">
            <p className="text-neutral-700">
              Already have an account?{" "}
              <Link
                href="/login"
                className="bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text font-semibold text-transparent underline-offset-4 hover:underline"
              >
                Login here
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
