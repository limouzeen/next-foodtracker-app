// 'use client';

// import { useMemo, useRef, useState } from 'react';
// import Link from 'next/link';
// import Image from 'next/image';

// type Gender = 'male' | 'female' | 'other' | '';

// // ใช้รูปโปรไฟล์จากโฟลเดอร์ images (ภายใต้ app/)
// import defaultAvatar from '../images/profile.jpg'; // <-- สำคัญ: เส้นทางจาก app/register/page.tsx ไป app/images/profile.jpg

// export default function RegisterPage() {
//   const [fullName, setFullName] = useState('');
//   const [email, setEmail]       = useState('');
//   const [password, setPassword] = useState('');
//   const [gender, setGender]     = useState<Gender>('');
//   const [file, setFile]         = useState<File | null>(null);

//   const inputRef = useRef<HTMLInputElement | null>(null);

//   const previewUrl = useMemo(() => {
//     if (!file) return '';
//     return URL.createObjectURL(file);
//   }, [file]);

//   const onPickImage = () => inputRef.current?.click();

//   const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const f = e.target.files?.[0];
//     if (!f) return;
//     if (!f.type.startsWith('image/')) {
//       alert('Please select an image file');
//       return;
//     }
//     setFile(f);
//   };

//   const onSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const fd = new FormData();
//     fd.append('fullName', fullName);
//     fd.append('email', email);
//     fd.append('password', password);
//     fd.append('gender', gender);
//     if (file) fd.append('avatar', file);

//     console.log('Register payload:', { fullName, email, password, gender, file });
//     alert('Submitted! (demo)');
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-300 via-fuchsia-300 to-pink-300">
//       <main className="mx-auto flex max-w-xl flex-col gap-6 px-6 py-10">
//         {/* Back to Home */}
//         <div className="flex items-center justify-between">
//           <Link
//             href="/"
//             className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-amber-700 shadow-sm backdrop-blur transition hover:scale-[1.02] hover:bg-white"
//           >
//             <span className="inline-block -ml-1">←</span> Back to Home
//           </Link>
//         </div>

//         {/* Card */}
//         <div className="rounded-3xl bg-white/80 p-6 shadow-2xl ring-1 ring-white/40 backdrop-blur">
//           {/* Header */}
//           <div className="mb-6 text-center">
//             <h1 className="text-3xl font-extrabold tracking-tight text-amber-900 md:text-4xl">
//               Create your account
//             </h1>
//             <p className="mt-2 text-sm text-neutral-600">Join Food Tracker — Track your meal!!!</p>
//           </div>

//           {/* Form */}
//           <form onSubmit={onSubmit} className="space-y-5">
//             {/* Avatar + Upload */}
//             <div className="flex flex-col items-center gap-4">
//               <div className="relative h-28 w-28 overflow-hidden rounded-full shadow-lg ring-4 ring-white/60">
//                 {previewUrl ? (
//                   <Image
//                     src={previewUrl}
//                     alt="Preview avatar"
//                     fill
//                     className="object-cover"
//                     unoptimized
//                     priority
//                   />
//                 ) : (
//                   <Image
//                     src={defaultAvatar}
//                     alt="Default avatar"
//                     fill
//                     className="object-cover"
//                     priority
//                   />
//                 )}
//               </div>

//               <input
//                 ref={inputRef}
//                 type="file"
//                 accept="image/*"
//                 className="hidden"
//                 onChange={onFileChange}
//               />

//               <div className="flex items-center gap-3">
//                 <button
//                   type="button"
//                   onClick={onPickImage}
//                   className="rounded-full bg-gradient-to-r from-pink-500 to-blue-500 px-5 py-2 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white/50"
//                 >
//                   Choose Photo
//                 </button>
//                 {file && (
//                   <button
//                     type="button"
//                     onClick={() => setFile(null)}
//                     className="rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-neutral-800 shadow hover:bg-white"
//                   >
//                     Remove
//                   </button>
//                 )}
//               </div>
//               <p className="text-xs text-neutral-600">PNG, JPG up to ~5MB</p>
//             </div>

//             {/* Full Name */}
//             <div>
//               <label className="mb-1 block text-sm font-medium text-amber-900">ชื่อ-สกุล</label>
//               <input
//                 value={fullName}
//                 onChange={(e) => setFullName(e.target.value)}
//                 required
//                 placeholder="เช่น Amarat K."
//                 className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-400/30"
//               />
//             </div>

//             {/* Email */}
//             <div>
//               <label className="mb-1 block text-sm font-medium text-amber-900">อีเมล</label>
//               <input
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//                 placeholder="you@example.com"
//                 className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-400/30"
//               />
//             </div>

//             {/* Password */}
//             <div>
//               <label className="mb-1 block text-sm font-medium text-amber-900">รหัสผ่าน</label>
//               <input
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//                 placeholder="••••••••"
//                 className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-400/30"
//               />
//             </div>

//             {/* Gender */}
//             <div>
//               <label className="mb-1 block text-sm font-medium text-amber-900">เพศ</label>
//               <select
//                 value={gender}
//                 onChange={(e) => setGender(e.target.value as Gender)}
//                 className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-400/30"
//               >
//                 <option value="">โปรดเลือก</option>
//                 <option value="male">ชาย</option>
//                 <option value="female">หญิง</option>
//                 <option value="other">อื่น ๆ</option>
//               </select>
//             </div>

//             {/* Submit */}
//             <button
//               type="submit"
//               className="mt-2 w-full rounded-xl bg-amber-900 px-5 py-3 text-base font-semibold text-white shadow-lg transition-transform hover:scale-[1.01] hover:bg-amber-800 focus:outline-none focus:ring-4 focus:ring-amber-300/50"
//             >
//               ลงทะเบียน
//             </button>
//           </form>

//           {/* Footer links */}
//           <div className="mt-6 text-center text-sm">
//             <p className="text-neutral-700">
//               Already have an account?{' '}
//               <Link
//                 href="/login"
//                 className="bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text font-semibold text-transparent underline-offset-4 hover:underline"
//               >
//                 Login here
//               </Link>
//             </p>
//           </div>
//         </div>

//         {/* Copyright */}
//         <footer className="mt-6 rounded-2xl border border-white/30 bg-gradient-to-r from-white/10 via-white/5 to-white/10 py-4 text-center backdrop-blur">
//           <p className="text-xs font-light tracking-wider text-white/80">
//             © {new Date().getFullYear()}{' '}
//             <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text font-semibold text-transparent">
//               Amarat
//             </span>{' '}
//             · All Rights Reserved
//           </p>
//         </footer>
//       </main>
//     </div>
//   );
// }
'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type Gender = 'male' | 'female' | 'other' | '';

// ใช้รูปโปรไฟล์จากโฟลเดอร์ images
import defaultAvatar from '../images/profile.jpg';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender]     = useState<Gender>('');
  const [file, setFile]         = useState<File | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const previewUrl = useMemo(() => {
    if (!file) return '';
    return URL.createObjectURL(file);
  }, [file]);

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
    const fd = new FormData();
    fd.append('fullName', fullName);
    fd.append('email', email);
    fd.append('password', password);
    fd.append('gender', gender);
    if (file) fd.append('avatar', file);

    console.log('Register payload:', { fullName, email, password, gender, file });
    alert('Submitted! (demo)');
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
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
              Create your account
            </h1>
            <p className="mt-2 text-sm text-neutral-600">Join Food Tracker — Track your meal!!!</p>
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

            {/* Password */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800">รหัสผ่าน</label>
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

            {/* Submit */}
            <button
              type="submit"
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 px-5 py-3 text-base font-semibold text-white shadow-lg transition-transform hover:scale-[1.01] hover:from-pink-600 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300/50"
            >
              ลงทะเบียน
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-6 text-center text-sm">
            <p className="text-neutral-700">
              Already have an account?{' '}
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
