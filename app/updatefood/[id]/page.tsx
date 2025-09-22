"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// ---------- helpers (ใช้ unknown ให้ปลอดภัย) ----------
function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
function asNullableString(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}
function asStringOr(v: unknown, fallback: string): string {
  return typeof v === "string" ? v : fallback;
}
type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snack";
function asMeal(v: unknown): MealType {
  if (v === "Breakfast" || v === "Lunch" || v === "Dinner" || v === "Snack") return v;
  return "Breakfast";
}
function toDateInputValue(v: unknown): string {
  // คืนค่า YYYY-MM-DD สำหรับ input[type=date]
  const d =
    typeof v === "string" || v instanceof Date
      ? new Date(v as string | Date)
      : new Date();
  if (isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000) // local date
    .toISOString()
    .slice(0, 10);
}
function toISODateFromInputYMD(ymd: string): string {
  // แปลง "YYYY-MM-DD" → ISO (ตั้งเวลา 00:00:00 local)
  const [y, m, d] = ymd.split("-").map(Number);
  if (!y || !m || !d) return new Date().toISOString();
  const dt = new Date(y, m - 1, d, 0, 0, 0);
  return dt.toISOString();
}

export default function UpdateFoodPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const foodId = Array.isArray(params.id) ? params.id[0] : params.id;

  const sb = supabase();

  // ---------- auth ----------
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authErr, setAuthErr] = useState<string | null>(null);

  // ---------- form state ----------
  const [name, setName] = useState("");
  const [meal, setMeal] = useState<MealType>("Breakfast");
  const [date, setDate] = useState<string>(""); // YYYY-MM-DD
  const [file, setFile] = useState<File | null>(null);
  const [baseImageUrl, setBaseImageUrl] = useState<string | null>(null); // URL ที่แสดงเมื่อยังไม่เปลี่ยนรูป

  const inputRef = useRef<HTMLInputElement | null>(null);
  const onPickImage = () => inputRef.current?.click();

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);

  // ---------- เลือกรูป ----------
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }
    setFile(f);
  };

  // ---------- โหลดผู้ใช้ ----------
  useEffect(() => {
    (async () => {
      try {
        setAuthErr(null);
        setAuthLoading(true);
        const { data: userData, error } = await sb.auth.getUser();
        if (error) throw error;
        const user = userData.user;
        if (!user) {
          router.replace("/login");
          return;
        }
        setUserId(user.id);
      } catch (e) {
        setAuthErr(e instanceof Error ? e.message : "Auth error");
      } finally {
        setAuthLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- โหลดข้อมูลอาหารตาม id ----------
  useEffect(() => {
    if (!userId || !foodId) return;

    (async () => {
      const { data, error } = await sb
        .from("food_tb")
        .select("id, user_id, foodname, meal, fooddate_at, food_image_url")
        .eq("id", foodId)
        .single();

      if (error || !data) {
        alert("ไม่พบรายการอาหารนี้หรือคุณไม่มีสิทธิ์เข้าถึง");
        router.replace("/dashboard");
        return;
      }

      // guard & ตรวจว่าของ user นี้จริงไหม
      if (!isObj(data) || asStringOr(data.user_id, "") !== userId) {
        alert("ไม่พบรายการอาหารนี้หรือคุณไม่มีสิทธิ์เข้าถึง");
        router.replace("/dashboard");
        return;
      }

      // set form
      setName(asStringOr(data.foodname, "(ไม่มีชื่ออาหาร)"));
      setMeal(asMeal(data.meal));
      setDate(toDateInputValue(data.fooddate_at));

      // สร้าง URL ของรูป (รองรับทั้ง external URL และ path ใน bucket)
      const raw = asNullableString(data.food_image_url);
      if (!raw) {
        setBaseImageUrl(null);
      } else if (raw.startsWith("http://") || raw.startsWith("https://")) {
        setBaseImageUrl(raw);
      } else {
        const { data: publicUrl } = sb.storage.from("food_bk").getPublicUrl(raw);
        setBaseImageUrl(publicUrl.publicUrl ?? null);
      }
    })();
  }, [sb, userId, foodId, router]);

  // ---------- submit (update + อัปโหลดไฟล์ถ้ามี) ----------
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !foodId) return;

    let imagePathToSave: string | undefined;

    // มีไฟล์ใหม่ → อัปโหลด
    if (file) {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `user-${userId}/${foodId}-${Date.now()}.${ext}`;
      const { error: upErr } = await sb.storage.from("food_bk").upload(path, file, {
        upsert: true,
        cacheControl: "3600",
      });
      if (upErr) {
        alert(`อัปโหลดรูปไม่สำเร็จ: ${upErr.message}`);
        return;
      }
      imagePathToSave = path; // เก็บ "path" ลง DB (dashboard จะ gen public URL เอง)
    }

    const payload: Record<string, unknown> = {
      foodname: name,
      meal,
      fooddate_at: toISODateFromInputYMD(date),
    };
    if (imagePathToSave) payload.food_image_url = imagePathToSave;

    const { error: updErr } = await sb.from("food_tb").update(payload).eq("id", foodId);
    if (updErr) {
      alert(`อัปเดตไม่สำเร็จ: ${updErr.message}`);
      return;
    }

    alert("อัปเดตสำเร็จ!");
    router.push("/dashboard");
  };

  if (authLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-gradient-to-br from-blue-300 via-fuchsia-300 to-pink-300">
        <div className="rounded-2xl bg-white/80 px-6 py-4 text-slate-700 shadow">กำลังโหลด...</div>
      </div>
    );
  }
  if (authErr) {
    return (
      <div className="grid min-h-screen place-items-center bg-gradient-to-br from-blue-300 via-fuchsia-300 to-pink-300">
        <div className="rounded-2xl bg-white/80 px-6 py-4 text-red-600 shadow">{authErr}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-300 via-fuchsia-300 to-pink-300">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10">
        {/* Top bar */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <h1 className="text-center text-3xl font-extrabold tracking-tight text-white drop-shadow md:text-4xl">
            Update Food
          </h1>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="group flex items-center gap-2 rounded-full bg-white/80 px-4 py-1 text-sm font-medium text-slate-800 shadow ring-1 ring-white/50 backdrop-blur transition hover:bg-white"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-3xl bg-white/85 p-6 shadow-2xl ring-1 ring-white/40 backdrop-blur">
          {/* รูป + upload */}
          <div className="mb-6 flex flex-col items-center gap-4">
            <div className="relative h-40 w-40 overflow-hidden rounded-2xl bg-white/70 shadow-xl ring-2 ring-white/60">
              {previewUrl ? (
                <Image src={previewUrl} alt="Food preview" fill className="object-cover" unoptimized priority />
              ) : baseImageUrl ? (
                <Image src={baseImageUrl} alt="Food current" fill className="object-cover" priority />
              ) : (
                <div className="grid h-full w-full place-items-center text-sm text-slate-500">No Image</div>
              )}
            </div>

            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onPickImage}
                className="rounded-full bg-gradient-to-r from-pink-500 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-300/50"
              >
                Choose Photo
              </button>
              {(file || baseImageUrl) && (
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setBaseImageUrl(null);
                  }}
                  className="rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-slate-800 shadow hover:bg-white"
                >
                Remove
                </button>
              )}
            </div>
            <p className="text-xs text-slate-600">PNG, JPG up to ~5MB</p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-800">ชื่ออาหาร</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="เช่น Salmon Teriyaki"
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800">มื้ออาหาร</label>
              <select
                value={meal}
                onChange={(e) => setMeal(e.target.value as MealType)}
                required
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30"
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Snack">Snack</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800">วันที่</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 px-5 py-3 text-base font-semibold text-white shadow-lg transition-transform hover:scale-[1.01] hover:from-pink-600 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300/50"
              >
                บันทึก
              </button>
            </div>
          </form>
        </div>

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
