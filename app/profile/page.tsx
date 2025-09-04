'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image, { StaticImageData } from 'next/image';

// รูปโปรไฟล์เริ่มต้น (ปรับ path ให้ตรงโปรเจกต์)
import defaultAvatar from '../images/profile.jpg';

type Gender = 'male' | 'female' | 'other' | '';

export default function ProfilePage() {
  // mock ข้อมูลผู้ใช้ที่ล็อกอิน (prefill ค่าเริ่มต้นให้ฟอร์ม)
  const currentUser = {
    fullName: 'Amarat K.',
    email: 'amarat@example.com',
    gender: 'male' as Gender,
    avatar: defaultAvatar as StaticImageData,
  };

  const [fullName, setFullName] = useState(currentUser.fullName);
  const [email, setEmail]       = useState(currentUser.email);
  const [password, setPassword] = useState(''); // ว่างไว้สำหรับเปลี่ยนรหัสผ่าน
  const [gender, setGender]     = useState<Gender>(currentUser.gender);
  const [file, setFile]         = useState<File | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [showPw, setShowPw] = useState(false);

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file]);

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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // TODO: call API /profile (PATCH) ด้วย FormData
    const fd = new FormData();
    fd.append('fullName', fullName);
    fd.append('email', email);
    if (password) fd.append('password', password);
    fd.append('gender', gender);
    if (file) fd.append('avatar', file);

    console.log('Profile update payload:', { fullName, email, password, gender, file });
    alert('Profile saved! (demo)');
    // ถ้าต้องการ กลับไป dashboard อัตโนมัติ: ใช้ useRouter().push('/dashboard')
  };

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
                  className="object-cover"
                  unoptimized
                  priority
                />
              ) : (
                <Image
                  src={currentUser.avatar}
                  alt="Current avatar"
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
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800">ชื่อ-สกุล</label>
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
              <label className="mb-1 block text-sm font-medium text-slate-800">อีเมล</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30"
              />
            </div>

            {/* Password (optional change) */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800">รหัสผ่าน (เปลี่ยน)</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="เว้นว่างหากไม่ต้องการเปลี่ยน"
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 pr-28 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-white/80 px-3 py-1 text-xs font-medium text-slate-700 shadow hover:bg-white"
                >
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800">เพศ</label>
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
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 px-5 py-3 text-base font-semibold text-white shadow-lg transition-transform hover:scale-[1.01] hover:from-pink-600 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300/50"
            >
              บันทึก
            </button>
          </form>
        </div>

        {/* Footer (คงธีมเดียวกัน) */}
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
