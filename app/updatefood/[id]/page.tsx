'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image, { StaticImageData } from 'next/image';
import { useParams, useRouter } from 'next/navigation';

// รูปตัวอย่าง (ปรับ path ให้ตรงโปรเจ็กต์)
import foodA from '../../images/food.jpg';
import foodB from '../../images/foodbanner.jpg';
import foodC from '../../images/profile.jpg';
import userAvatar from '../../images/profile.jpg';

type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

type FoodItem = {
  id: number;
  name: string;
  meal: MealType;
  date: string;               // 'YYYY-MM-DD'
  image: StaticImageData;
};

// ---- Mock DB สำหรับเดโม ----
const MOCK_DB: FoodItem[] = [
  { id: 1, name: 'Grilled Chicken Salad', meal: 'Lunch',     date: '2025-09-01', image: foodA },
  { id: 2, name: 'Oatmeal & Berries',     meal: 'Breakfast', date: '2025-09-01', image: foodB },
  { id: 3, name: 'Protein Smoothie',      meal: 'Snack',     date: '2025-09-01', image: foodC },
  { id: 4, name: 'Salmon Teriyaki',       meal: 'Dinner',    date: '2025-09-02', image: foodA },
];

export default function UpdateFoodPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const idNum = Number(Array.isArray(params.id) ? params.id[0] : params.id);

  // mock ผู้ใช้ที่ล็อกอิน (สำหรับมุมขวาบน)
  const currentUser = { name: 'Amarat', avatar: userAvatar as StaticImageData };

  // state ฟอร์ม
  const [name, setName]   = useState('');
  const [meal, setMeal]   = useState<MealType | ''>('');
  const [date, setDate]   = useState('');
  const [file, setFile]   = useState<File | null>(null);
  const [baseImage, setBaseImage] = useState<StaticImageData | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const onPickImage = () => inputRef.current?.click();

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    setFile(f);
  };

  // โหลดข้อมูลเดิมตาม id (mock)
  useEffect(() => {
    if (!Number.isFinite(idNum)) return;
    const found = MOCK_DB.find((x) => x.id === idNum);
    if (found) {
      setName(found.name);
      setMeal(found.meal);
      setDate(found.date);
      setBaseImage(found.image);
    } else {
      // ถ้าไม่พบ กลับไปหน้า dashboard (หรือจะแสดง not found ในหน้านี้ก็ได้)
      // router.replace('/dashboard');
    }
  }, [idNum, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: PATCH /api/foods/{idNum}
    const fd = new FormData();
    fd.append('name', name);
    fd.append('meal', meal);
    fd.append('date', date);
    if (file) fd.append('image', file);

    console.log('UpdateFood payload:', { id: idNum, name, meal, date, file });
    alert('Food updated! (demo)');
    // router.push('/dashboard');
  };

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
              href="/profile"
              className="group flex items-center gap-3 rounded-full bg-white/80 pl-1 pr-3 py-1 shadow ring-1 ring-white/50 backdrop-blur transition hover:bg-white"
              title="Go to Profile"
            >
              <span className="relative block h-9 w-9 overflow-hidden rounded-full ring-2 ring-white/60">
                <Image src={currentUser.avatar} alt={currentUser.name} fill className="object-cover" />
              </span>
              <span className="bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-sm font-semibold text-transparent">
                {currentUser.name}
              </span>
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
              ) : baseImage ? (
                <Image src={baseImage} alt="Food current" fill className="object-cover" priority />
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
              {(file || baseImage) && (
                <button
                  type="button"
                  onClick={() => { setFile(null); setBaseImage(null); }}
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
                <option value="">โปรดเลือก</option>
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

          <div className="mt-6 text-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-slate-800 shadow-sm backdrop-blur transition hover:scale-[1.02] hover:bg-white"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        <footer className="rounded-2xl border border-white/30 bg-gradient-to-r from-white/10 via-white/5 to-white/10 py-4 text-center backdrop-blur">
          <p className="text-xs font-light tracking-wider text-white/80">
            © {new Date().getFullYear()} <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text font-semibold text-transparent">Amarat</span> · All Rights Reserved
          </p>
        </footer>
      </main>
    </div>
  );
}
