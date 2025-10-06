"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image, { StaticImageData } from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import defaultAvatar from "../images/profile.jpg";

type Gender = "male" | "female" | "other" | "";
type ProfileRow = {
  fullname: string | null;
  user_image_url: string | null;
  gender: Gender | null;
  email: string | null;
};

type UserUpsert = {
  id: string;
  fullname: string | null;
  user_image_url?: string | null;
  gender: Gender | null;
  email: string | null;
};

type SupabaseErrorShape = {
  message: string;
  code?: string;
  details?: string | null;
  hint?: string | null;
  status?: number;
};
function isSupabaseErrorShape(x: unknown): x is SupabaseErrorShape {
  return typeof x === "object" && x !== null && "message" in x;
}

export default function ProfilePage() {
  const router = useRouter();
  const sb = supabase();

  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState<Gender>("");
  const [password, setPassword] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [baseImageUrl, setBaseImageUrl] = useState<string | StaticImageData>(defaultAvatar);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [showPw, setShowPw] = useState(false);

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);

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

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        setLoading(true);

        const { data: userData, error: userErr } = await sb.auth.getUser();
        if (userErr) throw userErr;

        const user = userData.user;
        if (!user) {
          router.replace("/login");
          return;
        }
        setUserId(user.id);
        setEmail(user.email ?? "");

        const base = sb
          .from("user_tb")
          .select("fullname, user_image_url, gender, email")
          .eq("id", user.id)
          .returns<ProfileRow>();

        const { data, error } = await base.maybeSingle();
        if (error) throw error;

        const row: ProfileRow | null =
          typeof data === "object" && data !== null ? (data as ProfileRow) : null;

        const name = row?.fullname ?? user.user_metadata?.fullname ?? user.email ?? "";
        setFullName(name);
        setGender(row?.gender ?? "");

        const raw = row?.user_image_url ?? "";
        if (!raw) {
          setBaseImageUrl(defaultAvatar);
        } else if (raw.startsWith("http://") || raw.startsWith("https://")) {
          setBaseImageUrl(raw);
        } else {
          const { data: signed } = await sb.storage
            .from("user_bk")
            .createSignedUrl(raw, 60 * 10);
          setBaseImageUrl(signed?.signedUrl ?? defaultAvatar);
        }
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : "Load profile error");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

const onSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!userId) return;

  try {
    setLoading(true);
    setErr(null);

    // 1) อัปโหลดรูป (ถ้ามี)
    let avatarPathToSave: string | undefined;
    if (file) {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `user-${userId}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await sb.storage
        .from("user_bk")
        .upload(path, file, { upsert: true, cacheControl: "3600" });
      if (upErr) throw upErr;
      avatarPathToSave = path;
    }

    // 2) เปลี่ยนรหัสผ่าน (ถ้ากรอก)
    let passwordChanged = false;
    if (password.trim()) {
      if (password.trim().length < 6) throw new Error("รหัสผ่านต้องยาวอย่างน้อย 6 ตัวอักษร");
      const { error: pwdErr } = await sb.auth.updateUser({ password: password.trim() });
      if (pwdErr) {
        if (pwdErr.message?.includes("New password should be different")) {
          console.warn("รหัสผ่านใหม่ตรงกับรหัสเดิม — ข้ามการเปลี่ยนรหัส");
        } else {
          throw pwdErr;
        }
      } else {
        passwordChanged = true;
      }
      setPassword("");
    }
// --- 3.1 อัปเดตชื่อใน metadata (คงเดิม) ---
const { error: metaErr } = await sb.auth.updateUser({ data: { fullname: fullName } });
if (metaErr) console.warn("update metadata fullname error:", metaErr);

// --- 4) เตรียมอีเมล
const desiredEmail = email.trim().toLowerCase().replace(/\u200B/g, "");
if (desiredEmail) {
  const res = await fetch("/api/update-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, newEmail: desiredEmail }),
  });

  const result: unknown = await res.json();
  if (
    typeof result === "object" &&
    result !== null &&
    "error" in result &&
    typeof (result as { error: unknown }).error === "string"
  ) {
    throw new Error((result as { error: string }).error);
  }
  // refresh user state ให้ได้ค่าอีเมลล่าสุดจาก auth
  const { data: after } = await sb.auth.getUser();
  setEmail(after.user?.email ?? desiredEmail);
}



    // 6) อัปเดตตาราง user_tb ด้วยค่าล่าสุดจาก Auth เท่านั้น
   const payload: Omit<UserUpsert, "id"> = {
  fullname: fullName,
  gender: gender || null,
  email: desiredEmail,
  ...(avatarPathToSave ? { user_image_url: avatarPathToSave } : {}),
};
await sb.from("user_tb")
  .upsert({ id: userId, ...payload }, { onConflict: "id" })
  .select()
  .single();

    // 7) รีเฟรชรูป preview (ถ้ามี)
    if (avatarPathToSave) {
      const { data: signed } = await sb.storage
        .from("user_bk")
        .createSignedUrl(avatarPathToSave, 60 * 10);
      setBaseImageUrl(signed?.signedUrl ?? defaultAvatar);
      setFile(null);
    }

    // 8) ถ้าเปลี่ยนรหัสผ่านสำเร็จ → บังคับล็อกเอาท์
    if (passwordChanged) {
      alert("เปลี่ยนรหัสผ่านและบันทึกโปรไฟล์เรียบร้อยแล้ว กรุณาเข้าสู่ระบบอีกครั้ง");
      await sb.auth.signOut();
      router.push("/login?pw_changed=1");
      return;
    }

    alert("บันทึกโปรไฟล์เรียบร้อยแล้ว");
    router.push("/dashboard");
    router.refresh();
  } catch (e: unknown) {
    console.error("Submit error:", e);
    setErr(e instanceof Error ? e.message : "Update profile error");
  } finally {
    setLoading(false);
  }
};


  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-gradient-to-br from-blue-300 via-fuchsia-300 to-pink-300">
        <div className="rounded-2xl bg-white/80 px-6 py-4 text-slate-700 shadow">
          กำลังโหลด...
        </div>
      </div>
    );
  }
  if (err) {
    return (
      <div className="grid min-h-screen place-items-center bg-gradient-to-br from-blue-300 via-fuchsia-300 to-pink-300">
        <div className="max-w-md rounded-2xl bg-white/80 px-6 py-4 text-red-700 shadow">
          {String(err)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-300 via-fuchsia-300 to-pink-300">
      <main className="mx-auto flex max-w-xl flex-col gap-6 px-6 py-10">
        {/* Header + Back */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow md:text-4xl">
            Edit Profile
          </h1>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-slate-800 shadow-sm backdrop-blur transition hover:scale-[1.02] hover:bg-white"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-3xl bg-white/85 p-6 shadow-2xl ring-1 ring-white/40 backdrop-blur">
          {/* Avatar + Upload */}
          <div className="mb-6 flex flex-col items-center gap-4">
            <div className="relative h-28 w-28 overflow-hidden rounded-full shadow-lg ring-4 ring-white/60">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="Preview avatar"
                  fill
                  sizes="7rem"
                  className="object-cover"
                  unoptimized
                  priority
                />
              ) : (
                <Image
                  src={baseImageUrl}
                  alt="Current avatar"
                  fill
                  sizes="7rem"
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
                className="rounded-full bg-gradient-to-r from-pink-500 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-300/50"
              >
                Choose Photo
              </button>
              {file && (
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-slate-800 shadow hover:bg-white"
                >
                  Remove
                </button>
              )}
            </div>
            <p className="text-xs text-slate-600">PNG, JPG up to ~5MB</p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-5" autoComplete="off">
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
                autoComplete="email"
                name="email"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                * @gmail.com/@yahoo.com/...
              </p>
            </div>

            {/* Password (optional) */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800">
                รหัสผ่าน (เปลี่ยน)
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="เว้นว่างหากไม่ต้องการเปลี่ยน"
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 pr-28 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30"
                  autoComplete="new-password"
                  name={`new-password-${userId ?? "anon"}`}
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

            {/* Save */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 px-5 py-3 text-base font-semibold text-white shadow-lg transition-transform hover:scale-[1.01] hover:from-pink-600 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300/50 disabled:opacity-60"
            >
              {loading ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <footer className="rounded-2xl border border-white/30 bg-gradient-to-r from-white/10 via-white/5 to-white/10 py-4 text-center backdrop-blur">
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
