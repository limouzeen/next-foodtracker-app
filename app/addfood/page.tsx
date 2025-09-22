
'use client';

export const dynamic = "force-dynamic";
export const revalidate = 0;            
export const fetchCache = "force-no-store";

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image, { StaticImageData } from 'next/image';
import { useRouter } from 'next/navigation';

import { supabase } from '@/lib/supabaseClient';

import placeholderFood from '../images/food.jpg';
import defaultAvatar from '../images/profile.jpg';

type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

// ---------- โปรไฟล์ในตาราง user_tb ----------
type Profile = {
  fullname: string | null;
  user_image_url: string | null; // เก็บ public URL หรือ path ของ bucket
};

export default function AddFoodPage() {
  const router = useRouter();
  const sb = supabase();

  // ---------- auth & profile ----------
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | StaticImageData>(defaultAvatar);
  const [authErr, setAuthErr] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ---------- form state ----------
  const [name, setName] = useState('');
  const [meal, setMeal] = useState<MealType | ''>('');
  const [date, setDate] = useState(''); // YYYY-MM-DD
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file]);

  // ---------- โหลดผู้ใช้ + โปรไฟล์ ----------
  useEffect(() => {
    (async () => {
      try {
        setAuthErr(null);
        setAuthLoading(true);

        // ผู้ใช้ที่ล็อกอิน
        const { data: u, error: uErr } = await sb.auth.getUser();
        if (uErr) throw uErr;
        const user = u.user;
        if (!user) {
          router.replace('/login');
          return;
        }
        setUserId(user.id);
        setUserEmail(user.email ?? null);

        // โปรไฟล์จาก user_tb
        const { data: p, error: pErr } = await sb
          .from('user_tb')
          .select('fullname, user_image_url')
          .eq('id', user.id)
          .single();

        if (pErr) {
          // ถ้ายังไม่มีแถว ให้ fallback จาก auth
          setProfile({
            fullname: user.user_metadata?.fullname ?? user.email ?? null,
            user_image_url: null,
          });
        } else {
          setProfile(p as Profile);
        }
      } catch (e: unknown) {
        setAuthErr(e instanceof Error ? e.message : 'โหลดโปรไฟล์ล้มเหลว');
      } finally {
        setAuthLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- สร้าง URL รูป (public ใช้ได้เลย / path -> signed URL) ----------
  useEffect(() => {
    (async () => {
      const raw = profile?.user_image_url ?? '';
      if (!raw) {
        setAvatarUrl(defaultAvatar);
        return;
      }
      if (raw.startsWith('http://') || raw.startsWith('https://')) {
        setAvatarUrl(raw);
        return;
      }
      // เป็น path ใน bucket โปรไฟล์ (สมมติชื่อ 'user_bk')
      const { data, error } = await sb.storage.from('user_bk').createSignedUrl(raw, 60 * 10);
      setAvatarUrl(!error && data?.signedUrl ? data.signedUrl : defaultAvatar);
    })();
  }, [profile, sb]);

  const onPickImage = () => inputRef.current?.click();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    setFile(f);
  };

  const getFileExt = (filename: string) => (filename.split('.').pop() || 'jpg').toLowerCase();
  const getErrMsg = (e: unknown) =>
    e instanceof Error ? e.message : typeof e === 'string' ? e : 'บันทึกเมนูไม่สำเร็จ';

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setErr(null);
      setLoading(true);

      // ต้องมีผู้ใช้
      const { data: u, error: uErr } = await sb.auth.getUser();
      if (uErr) throw uErr;
      const user = u.user;
      if (!user) {
        router.replace('/login');
        return;
      }

      // ค่าที่บังคับ
      const foodname = name.trim();
      const mealText = meal as MealType;
      const fooddate = date;
      if (!foodname || !mealText || !fooddate) throw new Error('กรอกข้อมูลให้ครบ');

      // อัปโหลดรูปอาหาร (สมมติ bucket: 'food_bk')
      let foodImageValue: string | null = null;
      if (file) {
        const ext = getFileExt(file.name);
        const path = `${user.id}/food-${Date.now()}.${ext}`;

        const { error: uploadErr } = await sb.storage.from('food_bk').upload(path, file, { upsert: true });
        if (uploadErr) throw uploadErr;

        const { data: pub } = sb.storage.from('food_bk').getPublicUrl(path);
        foodImageValue = pub?.publicUrl || path; // public -> URL, private -> path
      }

      // insert ลง food_tb
      const { error: insErr } = await sb.from('food_tb').insert({
        foodname,
        meal: mealText,
        fooddate_at: fooddate,         // YYYY-MM-DD
        food_image_url: foodImageValue,
        user_id: user.id,
      });
      if (insErr) throw insErr;

      alert('บันทึกสำเร็จ!');
      router.replace('/dashboard');
    } catch (e: unknown) {
      setErr(getErrMsg(e));
      console.error('AddFood error:', e);
    } finally {
      setLoading(false);
    }
  };

  const displayName = profile?.fullname || userEmail || 'User';

  // โหลดโปรไฟล์อยู่ (โชว์สถานะนิดหน่อย)
  if (authLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-gradient-to-br from-blue-300 via-fuchsia-300 to-pink-300">
        <div className="rounded-2xl bg-white/80 px-6 py-4 text-slate-700 shadow">กำลังโหลดโปรไฟล์...</div>
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
        {/* Top bar: Title + User */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <h1 className="text-center text-3xl font-extrabold tracking-tight text-white drop-shadow md:text-4xl">
            Add Food
          </h1>

          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="group flex items-center gap-3 rounded-full bg-white/80 pl-1 pr-3 py-1 shadow ring-1 ring-white/50 backdrop-blur transition hover:bg-white"
              title="Go to Profile"
            >
              <span className="relative block h-9 w-9 overflow-hidden rounded-full ring-2 ring-white/60">
                {/* ใช้ avatarUrl + displayName ที่โหลดมาจาก Supabase */}
                <Image src={avatarUrl} alt={displayName} fill className="object-cover" priority />
              </span>
              <span className="bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-sm font-semibold text-transparent">
                {displayName}
              </span>
            </Link>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-3xl bg-white/85 p-6 shadow-2xl ring-1 ring-white/40 backdrop-blur">
          {/* รูป + ปุ่มเลือกไฟล์ */}
          <div className="mb-6 flex flex-col items-center gap-4">
            <div className="relative h-40 w-40 overflow-hidden rounded-2xl bg-white/70 shadow-xl ring-2 ring-white/60">
              {previewUrl ? (
                <Image src={previewUrl} alt="Food preview" fill className="object-cover" unoptimized priority />
              ) : (
                <Image src={placeholderFood} alt="Placeholder" fill className="object-cover" priority />
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
          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* ชื่ออาหาร */}
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-800">ชื่ออาหาร</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="เช่น Grilled Chicken Salad"
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30"
              />
            </div>

            {/* มื้ออาหาร */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800">มื้ออาหาร</label>
              <select
                value={meal}
                onChange={(e) => setMeal(e.target.value as MealType)}
                required
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30"
              >
                <option value="">โปรดเลือก</option>
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Snack">Snack</option>
              </select>
            </div>

            {/* วันเดือนปี */}
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

            {/* Save button */}
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 px-5 py-3 text-base font-semibold text-white shadow-lg transition-transform hover:scale-[1.01] hover:from-pink-600 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300/50 disabled:opacity-60"
              >
                {loading ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
              {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
            </div>
          </form>

          {/* Back link */}
          <div className="mt-6 text-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-slate-800 shadow-sm backdrop-blur transition hover:scale-[1.02] hover:bg-white"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="rounded-2xl border border-white/30 bg-gradient-to-r from-white/10 via-white/5 to-white/10 py-4 text-center backdrop-blur">
          <p className="text-xs font-light tracking-wider text-white/80">
            © {new Date().getFullYear()}{' '}
            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text font-semibold text-transparent">
              Amarat
            </span>{' '}
            · All Rights Reserved
          </p>
        </footer>
      </main>
    </div>
  );
}
