// 'use client';

// import { useMemo, useState } from 'react';
// import Link from 'next/link';
// import Image, { StaticImageData } from 'next/image';

// // รูปตัวอย่าง (ปรับ path ให้ตรงโปรเจ็กต์คุณ)
// import foodA from '../images/food.jpg';
// import foodB from '../images/foodbanner.jpg';
// import foodC from '../images/profile.jpg';

// type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
// type FoodItem = {
//   id: number;
//   date: string;             // ISO yyyy-mm-dd
//   image: StaticImageData;
//   name: string;
//   meal: MealType;
// };

// // Mock data
// const ALL_MOCK: FoodItem[] = [
//   { id: 1,  date: '2025-09-01', image: foodA, name: 'Grilled Chicken Salad', meal: 'Lunch' },
//   { id: 2,  date: '2025-09-01', image: foodB, name: 'Oatmeal & Berries',    meal: 'Breakfast' },
//   { id: 3,  date: '2025-09-01', image: foodC, name: 'Protein Smoothie',      meal: 'Snack' },
//   { id: 4,  date: '2025-09-02', image: foodA, name: 'Salmon Teriyaki',        meal: 'Dinner' },
//   { id: 5,  date: '2025-09-02', image: foodB, name: 'Caesar Wrap',            meal: 'Lunch' },
//   { id: 6,  date: '2025-09-02', image: foodC, name: 'Greek Yogurt',           meal: 'Breakfast' },
//   { id: 7,  date: '2025-09-03', image: foodA, name: 'Avocado Toast',          meal: 'Breakfast' },
//   { id: 8,  date: '2025-09-03', image: foodB, name: 'Sushi Set',              meal: 'Dinner' },
//   { id: 9,  date: '2025-09-03', image: foodC, name: 'Chicken Pad Thai',       meal: 'Lunch' },
//   { id:10,  date: '2025-09-04', image: foodA, name: 'Pumpkin Soup',           meal: 'Dinner' },
//   { id:11,  date: '2025-09-04', image: foodB, name: 'Mango Sticky Rice',      meal: 'Snack' },
//   { id:12,  date: '2025-09-04', image: foodC, name: 'Beef Bowl',              meal: 'Lunch' },
//   { id:13,  date: '2025-09-05', image: foodA, name: 'Pancakes',               meal: 'Breakfast' },
//   { id:14,  date: '2025-09-05', image: foodB, name: 'Tom Yum Soup',           meal: 'Dinner' },
// ];

// const PAGE_SIZE = 7;

// function MealBadge({ meal }: { meal: MealType }) {
//   const color =
//     meal === 'Breakfast' ? 'from-amber-200 to-yellow-200 text-amber-800' :
//     meal === 'Lunch'     ? 'from-emerald-200 to-teal-200 text-emerald-800' :
//     meal === 'Dinner'    ? 'from-indigo-200 to-blue-200 text-indigo-800' :
//                            'from-pink-200 to-fuchsia-200 text-pink-800';
//   return (
//     <span className={`inline-flex items-center rounded-full bg-gradient-to-r ${color} px-2.5 py-0.5 text-xs font-semibold ring-1 ring-white/60`}>
//       {meal}
//     </span>
//   );
// }

// export default function DashboardPage() {
//   const [query, setQuery] = useState('');
//   const [page, setPage]   = useState(1);
//   const [items, setItems] = useState<FoodItem[]>(ALL_MOCK);

//   // จัดเรียงล่าสุดอยู่บน + filter ตามชื่ออาหาร
//   const filtered = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     const byName = q ? items.filter(x => x.name.toLowerCase().includes(q)) : items;
//     return byName.slice().sort((a, b) => +new Date(b.date) - +new Date(a.date));
//   }, [items, query]);

//   // Pagination
//   const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
//   const currentPage = Math.min(page, totalPages);
//   const start       = (currentPage - 1) * PAGE_SIZE;
//   const pageItems   = filtered.slice(start, start + PAGE_SIZE);

//   const handleSearchSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     setPage(1); // กลับหน้าแรกเมื่อค้นหา
//   };

//   const onEdit = (id: number) => {
//     // TODO: router.push(`/updatefood?id=${id}`)
//     alert(`Edit item #${id} (demo)`);
//   };

//   const onDelete = (id: number) => {
//     // mock delete ในหน้า
//     setItems(prev => prev.filter(x => x.id !== id));
//   };

//   const showingFrom = filtered.length === 0 ? 0 : start + 1;
//   const showingTo   = start + pageItems.length;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-300 via-fuchsia-300 to-pink-300">
//       <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
//         {/* Header */}
//         <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
//           <h1 className="text-center text-3xl font-extrabold tracking-tight text-white drop-shadow md:text-4xl">
//             Dashboard
//           </h1>

//           <div className="flex w-full flex-col items-stretch gap-3 md:w-auto md:flex-row">
//             {/* Search */}
//             <form onSubmit={handleSearchSubmit} className="flex w-full items-center gap-2">
//               <div className="relative w-full md:w-80">
//                 <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-60">
//                   {/* Search icon */}
//                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 21l-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
//                 </span>
//                 <input
//                   value={query}
//                   onChange={(e) => setQuery(e.target.value)}
//                   placeholder="Search by food name..."
//                   className="w-full rounded-xl border border-white/40 bg-white/85 pl-10 pr-10 py-2 text-sm text-slate-800 outline-none backdrop-blur transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30"
//                 />
//                 {query && (
//                   <button
//                     type="button"
//                     onClick={() => setQuery('')}
//                     className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-white/80 px-2 py-0.5 text-xs text-slate-700 shadow hover:bg-white"
//                     aria-label="Clear search"
//                   >
//                     Clear
//                   </button>
//                 )}
//               </div>
//               <button
//                 type="submit"
//                 className="rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-md transition-transform hover:scale-[1.02] hover:from-pink-600 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300/50"
//               >
//                 Search
//               </button>
//             </form>

//             {/* Add Food */}
//             <Link
//               href="/addfood"
//               className="rounded-xl bg-white/90 px-5 py-2 text-center text-sm font-semibold text-slate-800 shadow-md backdrop-blur transition-transform hover:scale-[1.02] hover:bg-white focus:outline-none focus:ring-4 focus:ring-white/50"
//             >
//               + Add Food
//             </Link>
//           </div>
//         </div>

//         {/* Card/Table */}
//         <div className="overflow-hidden rounded-3xl bg-white/85 shadow-2xl ring-1 ring-white/40 backdrop-blur">
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-neutral-200/70">
//               <thead className="sticky top-0 z-10 bg-white/85 backdrop-blur">
//                 <tr>
//                   <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Date</th>
//                   <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Image</th>
//                   <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Food Name</th>
//                   <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Meal</th>
//                   <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-neutral-200/60">
//                 {pageItems.map((item) => (
//                   <tr key={item.id} className="transition hover:bg-white/90">
//                     <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-800">
//                       {new Date(item.date).toLocaleDateString()}
//                     </td>
//                     <td className="px-4 py-3">
//                       <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-xl bg-white/60 shadow ring-2 ring-white/50">
//                         <Image
//                           src={item.image}
//                           alt={item.name}
//                           width={56}
//                           height={56}
//                           className="h-14 w-14 object-cover"
//                         />
//                       </div>
//                     </td>
//                     <td className="px-4 py-3 text-sm font-semibold text-slate-900">{item.name}</td>
//                     <td className="px-4 py-3 text-sm text-slate-800">
//                       <MealBadge meal={item.meal} />
//                     </td>
//                     <td className="whitespace-nowrap px-4 py-3 text-right">
//                       <div className="flex justify-end gap-2">
//                         <button
//                           onClick={() => onEdit(item.id)}
//                           className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm ring-1 ring-indigo-200/60 transition hover:bg-white hover:ring-indigo-300"
//                         >
//                           Edit
//                         </button>
//                         <button
//                           onClick={() => onDelete(item.id)}
//                           className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-pink-700 shadow-sm ring-1 ring-pink-200/60 transition hover:bg-white hover:ring-pink-300"
//                         >
//                           Delete
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}

//                 {pageItems.length === 0 && (
//                   <tr>
//                     <td colSpan={5} className="px-4 py-12">
//                       <div className="mx-auto max-w-md rounded-2xl border border-dashed border-slate-200 bg-white/70 p-6 text-center text-sm text-slate-600">
//                         No items found.
//                         <div className="mt-4">
//                           <Link
//                             href="/addfood"
//                             className="inline-block rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow hover:from-pink-600 hover:to-indigo-700"
//                           >
//                             + Add your first food
//                           </Link>
//                         </div>
//                       </div>
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Footer bar of table: results + pagination */}
//           <div className="flex flex-col gap-3 border-t border-white/40 bg-white/75 px-4 py-3 md:flex-row md:items-center md:justify-between">
//             <span className="text-xs text-slate-600">
//               Showing <strong>{showingFrom}</strong>–<strong>{showingTo}</strong> of <strong>{filtered.length}</strong> items
//             </span>
//             <div className="flex items-center justify-end gap-2">
//               <button
//                 onClick={() => setPage(p => Math.max(1, p - 1))}
//                 disabled={currentPage === 1}
//                 className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-700 shadow disabled:opacity-50"
//                 aria-label="Previous page"
//               >
//                 ← Prev
//               </button>
//               <span className="text-xs text-slate-600">Page {currentPage} / {totalPages}</span>
//               <button
//                 onClick={() => setPage(p => Math.min(totalPages, p + 1))}
//                 disabled={currentPage === totalPages}
//                 className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-700 shadow disabled:opacity-50"
//                 aria-label="Next page"
//               >
//                 Next →
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Back Home */}
//         <div className="flex justify-center">
//           <Link
//             href="/"
//             className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-slate-800 shadow-sm backdrop-blur transition hover:scale-[1.02] hover:bg-white"
//           >
//             ← Back to Home
//           </Link>
//         </div>

//         {/* Footer */}
//         <footer className="mt-2 rounded-2xl border border-white/30 bg-gradient-to-r from-white/10 via-white/5 to-white/10 py-4 text-center backdrop-blur">
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

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image, { StaticImageData } from 'next/image';
import { useRouter } from 'next/navigation';

// รูปตัวอย่าง (ปรับ path ให้ตรงโปรเจ็กต์คุณ)
import foodA from '../images/food.jpg';
import foodB from '../images/foodbanner.jpg';
import foodC from '../images/profile.jpg';

// ใช้เป็นรูปโปรไฟล์ผู้ใช้ที่ล็อกอิน (mock)
import avatarImg from '../images/profile.jpg';

type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
type FoodItem = {
  id: number;
  date: string;             // ISO yyyy-mm-dd
  image: StaticImageData;
  name: string;
  meal: MealType;
};

// Mock data
const ALL_MOCK: FoodItem[] = [
  { id: 1,  date: '2025-09-01', image: foodA, name: 'Grilled Chicken Salad', meal: 'Lunch' },
  { id: 2,  date: '2025-09-01', image: foodB, name: 'Oatmeal & Berries',    meal: 'Breakfast' },
  { id: 3,  date: '2025-09-01', image: foodC, name: 'Protein Smoothie',      meal: 'Snack' },
  { id: 4,  date: '2025-09-02', image: foodA, name: 'Salmon Teriyaki',        meal: 'Dinner' },
  { id: 5,  date: '2025-09-02', image: foodB, name: 'Caesar Wrap',            meal: 'Lunch' },
  { id: 6,  date: '2025-09-02', image: foodC, name: 'Greek Yogurt',           meal: 'Breakfast' },
  { id: 7,  date: '2025-09-03', image: foodA, name: 'Avocado Toast',          meal: 'Breakfast' },
  { id: 8,  date: '2025-09-03', image: foodB, name: 'Sushi Set',              meal: 'Dinner' },
  { id: 9,  date: '2025-09-03', image: foodC, name: 'Chicken Pad Thai',       meal: 'Lunch' },
  { id:10,  date: '2025-09-04', image: foodA, name: 'Pumpkin Soup',           meal: 'Dinner' },
  { id:11,  date: '2025-09-04', image: foodB, name: 'Mango Sticky Rice',      meal: 'Snack' },
  { id:12,  date: '2025-09-04', image: foodC, name: 'Beef Bowl',              meal: 'Lunch' },
  { id:13,  date: '2025-09-05', image: foodA, name: 'Pancakes',               meal: 'Breakfast' },
  { id:14,  date: '2025-09-05', image: foodB, name: 'Tom Yum Soup',           meal: 'Dinner' },
];

const PAGE_SIZE = 7;

function MealBadge({ meal }: { meal: MealType }) {
  const color =
    meal === 'Breakfast' ? 'from-amber-200 to-yellow-200 text-amber-800' :
    meal === 'Lunch'     ? 'from-emerald-200 to-teal-200 text-emerald-800' :
    meal === 'Dinner'    ? 'from-indigo-200 to-blue-200 text-indigo-800' :
                           'from-pink-200 to-fuchsia-200 text-pink-800';
  return (
    <span className={`inline-flex items-center rounded-full bg-gradient-to-r ${color} px-2.5 py-0.5 text-xs font-semibold ring-1 ring-white/60`}>
      {meal}
    </span>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  // mock ผู้ใช้ที่ล็อกอิน
  const currentUser = {
    name: 'Amarat',
    avatar: avatarImg as StaticImageData,
  };

  const [query, setQuery] = useState('');
  const [page, setPage]   = useState(1);
  const [items, setItems] = useState<FoodItem[]>(ALL_MOCK);

  // จัดเรียงล่าสุดอยู่บน + filter ตามชื่ออาหาร
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const byName = q ? items.filter(x => x.name.toLowerCase().includes(q)) : items;
    return byName.slice().sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }, [items, query]);

  // Pagination
  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start       = (currentPage - 1) * PAGE_SIZE;
  const pageItems   = filtered.slice(start, start + PAGE_SIZE);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const onEdit = (id: number) => {
    // TODO: router.push(`/updatefood?id=${id}`)
    alert(`Edit item #${id} (demo)`);
  };

  const onDelete = (id: number) => {
    setItems(prev => prev.filter(x => x.id !== id));
  };

  const onLogout = () => {
    // TODO: clear auth state/token
    router.push('/login');
  };

  const showingFrom = filtered.length === 0 ? 0 : start + 1;
  const showingTo   = start + pageItems.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-300 via-fuchsia-300 to-pink-300">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
        {/* Top bar: Title + User */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <h1 className="text-center text-3xl font-extrabold tracking-tight text-white drop-shadow md:text-4xl">
            Dashboard
          </h1>

          {/* User chip + Logout */}
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
            <button
              onClick={onLogout}
              className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-800 shadow-md backdrop-blur transition hover:scale-[1.02] hover:bg-white focus:outline-none focus:ring-4 focus:ring-white/50"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Actions row: Search + Add Food */}
        <div className="flex w-full flex-col items-stretch gap-3 md:flex-row md:items-center md:justify-between">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="flex w-full items-center gap-2 md:max-w-lg">
            <div className="relative w-full">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-60">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 21l-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by food name..."
                className="w-full rounded-xl border border-white/40 bg-white/85 pl-10 pr-10 py-2 text-sm text-slate-800 outline-none backdrop-blur transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-white/80 px-2 py-0.5 text-xs text-slate-700 shadow hover:bg-white"
                  aria-label="Clear search"
                >
                  Clear
                </button>
              )}
            </div>
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-md transition-transform hover:scale-[1.02] hover:from-pink-600 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300/50"
            >
              Search
            </button>
          </form>

          {/* Add Food */}
          <Link
            href="/addfood"
            className="rounded-xl bg-white/90 px-5 py-2 text-center text-sm font-semibold text-slate-800 shadow-md backdrop-blur transition-transform hover:scale-[1.02] hover:bg-white focus:outline-none focus:ring-4 focus:ring-white/50"
          >
            + Add Food
          </Link>
        </div>

        {/* Card/Table */}
        <div className="overflow-hidden rounded-3xl bg-white/85 shadow-2xl ring-1 ring-white/40 backdrop-blur">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200/70">
              <thead className="sticky top-0 z-10 bg-white/85 backdrop-blur">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Image</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Food Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Meal</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/60">
                {pageItems.map((item) => (
                  <tr key={item.id} className="transition hover:bg-white/90">
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-800">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-xl bg-white/60 shadow ring-2 ring-white/50">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={56}
                          height={56}
                          className="h-14 w-14 object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">{item.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-800">
                      <MealBadge meal={item.meal} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onEdit(item.id)}
                          className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm ring-1 ring-indigo-200/60 transition hover:bg-white hover:ring-indigo-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(item.id)}
                          className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-pink-700 shadow-sm ring-1 ring-pink-200/60 transition hover:bg-white hover:ring-pink-300"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {pageItems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12">
                      <div className="mx-auto max-w-md rounded-2xl border border-dashed border-slate-200 bg-white/70 p-6 text-center text-sm text-slate-600">
                        No items found.
                        <div className="mt-4">
                          <Link
                            href="/addfood"
                            className="inline-block rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow hover:from-pink-600 hover:to-indigo-700"
                          >
                            + Add your first food
                          </Link>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table footer: results + pagination */}
          <div className="flex flex-col gap-3 border-t border-white/40 bg-white/75 px-4 py-3 md:flex-row md:items-center md:justify-between">
            <span className="text-xs text-slate-600">
              Showing <strong>{showingFrom}</strong>–<strong>{showingTo}</strong> of <strong>{filtered.length}</strong> items
            </span>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-700 shadow disabled:opacity-50"
                aria-label="Previous page"
              >
                ← Prev
              </button>
              <span className="text-xs text-slate-600">Page {currentPage} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-700 shadow disabled:opacity-50"
                aria-label="Next page"
              >
                Next →
              </button>
            </div>
          </div>
        </div>

        {/* Back Home */}
        
        {/* Footer */}
        <footer className="mt-2 rounded-2xl border border-white/30 bg-gradient-to-r from-white/10 via-white/5 to-white/10 py-4 text-center backdrop-blur">
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
