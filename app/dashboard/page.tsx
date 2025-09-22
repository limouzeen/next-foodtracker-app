"use client";

export const dynamic = "force-dynamic";



import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image, { StaticImageData } from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import defaultAvatar from "../images/profile.jpg";

const PAGE_SIZE = 7;

type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snack" | null;

// ---------- helpers เพื่อใช้กับ unknown ----------
function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
function asNullableString(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}
function asStringOr(v: unknown, fallback: string): string {
  return typeof v === "string" ? v : fallback;
}
function asMeal(v: unknown): Exclude<MealType, null> {
  if (v === "Breakfast" || v === "Lunch" || v === "Dinner" || v === "Snack") return v;
  return "Breakfast"; // fallback
}
function asISODate(v: unknown): string {
  const d =
    typeof v === "string" || v instanceof Date
      ? new Date(v as string | Date)
      : new Date();
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

// ---------- แบบที่ UI ใช้หลังแปลงจาก DB ----------
type FoodItemUI = {
  id: string;      // uuid จาก DB
  date: string;    // ISO string ใช้แสดงในตาราง
  image: string;   // URL สำหรับ <Image src=...>
  name: string;    // ชื่ออาหาร
  meal: Exclude<MealType, null>;
};

function MealBadge({ meal }: { meal: Exclude<MealType, null> }) {
  const color =
    meal === "Breakfast"
      ? "from-amber-200 to-yellow-200 text-amber-800"
      : meal === "Lunch"
      ? "from-emerald-200 to-teal-200 text-emerald-800"
      : meal === "Dinner"
      ? "from-indigo-200 to-blue-200 text-indigo-800"
      : "from-pink-200 to-fuchsia-200 text-pink-800";
  return (
    <span
      className={`inline-flex items-center rounded-full bg-gradient-to-r ${color} px-2.5 py-0.5 text-xs font-semibold ring-1 ring-white/60`}
    >
      {meal}
    </span>
  );
}

type Profile = {
  fullname: string | null;
  user_image_url: string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const sb = supabase();

  // ---------- Auth & Profile ----------
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authErr, setAuthErr] = useState<string | null>(null);

  // ---------- Avatar ----------
  const [avatarUrl, setAvatarUrl] = useState<string | StaticImageData>(defaultAvatar);

  // ---------- Foods (มาจาก DB) ----------
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<FoodItemUI[]>([]);

  function getErrMsg(e: unknown): string {
    if (e instanceof Error) return e.message;
    if (typeof e === "string") return e;
    return "Auth/Profile error";
  }

  // 1) โหลด user + โปรไฟล์ (ใช้ unknown + guard)
  useEffect(() => {
    (async () => {
      try {
        setAuthErr(null);
        setAuthLoading(true);

        const { data: userData, error: userErr } = await sb.auth.getUser();
        if (userErr) throw userErr;
        const user = userData.user;
        if (!user) {
          router.replace("/login");
          return;
        }
        setUserId(user.id);
        setUserEmail(user.email ?? null);

        const { data: p, error: pErr } = await sb
          .from("user_tb")
          .select("fullname, user_image_url")
          .eq("id", user.id)
          .single();

        if (pErr || !p) {
          setProfile({
            fullname: user.user_metadata?.fullname ?? user.email ?? null,
            user_image_url: null,
          });
        } else {
          // p เป็น unknown-ish → ตรวจสอบก่อน
          let fullname: string | null = null;
          let user_image_url: string | null = null;
          if (isObj(p)) {
            fullname = asNullableString(p.fullname);
            user_image_url = asNullableString(p.user_image_url);
          }
          setProfile({
            fullname: fullname ?? user.user_metadata?.fullname ?? user.email ?? null,
            user_image_url: user_image_url ?? null,
          });
        }
      } catch (e: unknown) {
        setAuthErr(getErrMsg(e));
      } finally {
        setAuthLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) สร้าง avatar URL จากโปรไฟล์ (public URL หรือ signed URL ถ้าเป็น path)
  useEffect(() => {
    (async () => {
      const raw = profile?.user_image_url ?? "";
      if (!raw) {
        setAvatarUrl(defaultAvatar);
        return;
      }
      if (raw.startsWith("http://") || raw.startsWith("https://")) {
        setAvatarUrl(raw);
        return;
      }
      const { data, error } = await sb.storage.from("user_bk").createSignedUrl(raw, 60 * 10);
      setAvatarUrl(!error && data?.signedUrl ? data.signedUrl : (defaultAvatar as StaticImageData));
    })();
  }, [profile, sb]);

  // 3) โหลดอาหารของ user จาก DB (ใช้ unknown + guard)
  useEffect(() => {
    if (!userId) return;

    let active = true;

    const fetchFoods = async () => {
      const { data, error } = await sb
        .from("food_tb")
        .select("id, user_id, foodname, meal, fooddate_at, food_image_url")
        .eq("user_id", userId)
        .order("fooddate_at", { ascending: false })
        .limit(200);

      if (error) {
        console.error("load foods error:", error);
        return;
      }

      const rows = (data ?? []) as unknown[];

      const mapped: FoodItemUI[] = rows.map((r) => {
        // ปลอดภัยขึ้นด้วยการ guard ทุกฟิลด์
        if (!isObj(r)) {
          return {
            id: crypto?.randomUUID?.() ?? String(Date.now()),
            date: new Date().toISOString(),
            image: "/images/food-placeholder.jpg",
            name: "(ไม่ทราบข้อมูล)",
            meal: "Breakfast",
          };
        }

        const id = asStringOr(r.id, crypto?.randomUUID?.() ?? String(Date.now()));
        const name = asStringOr(r.foodname, "(ไม่มีชื่ออาหาร)");
        const meal = asMeal(r.meal);
        const dateIso = asISODate(r.fooddate_at);

        let img = "/images/food-placeholder.jpg";
        const raw = asNullableString(r.food_image_url);
        if (raw) {
          if (raw.startsWith("http://") || raw.startsWith("https://")) {
            img = raw;
          } else {
            const { data: publicUrl } = sb.storage.from("food_bk").getPublicUrl(raw);
            img = publicUrl.publicUrl ?? img;
          }
        }

        return { id, date: dateIso, image: img, name, meal };
      });

      if (active) setItems(mapped);
    };

    fetchFoods();

    // (ออปชัน) subscribe realtime เฉพาะของ user นี้
    const channel = sb
      .channel("food_tb:user")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "food_tb", filter: `user_id=eq.${userId}` },
        () => fetchFoods()
      )
      .subscribe();

    return () => {
      active = false;
      sb.removeChannel(channel);
    };
  }, [sb, userId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const byName = q ? items.filter((x) => x.name.toLowerCase().includes(q)) : items;
    return byName.slice().sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }, [items, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  // id เป็น string (uuid)
  const onEdit = (id: string) => {
    router.push(`/updatefood/${id}`);
  };

  const onDelete = async (id: string) => {
    const { error } = await sb.from("food_tb").delete().eq("id", id);
    if (!error) {
      setItems((prev) => prev.filter((x) => x.id !== id));
    } else {
      console.error("delete failed:", error);
    }
  };

  const onLogout = async () => {
    await sb.auth.signOut();
    router.replace("/login");
  };

  const showingFrom = filtered.length === 0 ? 0 : start + 1;
  const showingTo = start + pageItems.length;

  // Loading/Err state
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

  const displayName = profile?.fullname || userEmail || "User";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-300 via-fuchsia-300 to-pink-300">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
        {/* Top bar */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <h1 className="text-center text-3xl font-extrabold tracking-tight text-white drop-shadow md:text-4xl">
            Dashboard
          </h1>

          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="group flex items-center gap-3 rounded-full bg-white/80 pl-1 pr-3 py-1 shadow ring-1 ring-white/50 backdrop-blur transition hover:bg-white"
              title="Go to Profile"
            >
              <span className="relative block h-9 w-9 overflow-hidden rounded-full ring-2 ring-white/60">
                <Image src={avatarUrl} alt={displayName} fill className="object-cover" priority />
              </span>
              <span className="bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-sm font-semibold text-transparent">
                {displayName}
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
          <form onSubmit={handleSearchSubmit} className="flex w-full items-center gap-2 md:max-w-lg">
            <div className="relative w-full">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-60">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 21l-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
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
                  onClick={() => setQuery("")}
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

          <Link
            href="/addfood"
            className="rounded-xl bg-white/90 px-5 py-2 text-center text-sm font-semibold text-slate-800 shadow-md backdrop-blur transition-transform hover:scale-[1.02] hover:bg-white"
          >
            + Add Food
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-3xl bg-white/85 shadow-2xl ring-1 ring-white/40 backdrop-blur">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200/70">
              <thead className="sticky top-0 z-10 bg-white/85 backdrop-blur">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Image
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Food Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Meal
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Actions
                  </th>
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

          {/* Table footer */}
          <div className="flex flex-col gap-3 border-t border-white/40 bg-white/75 px-4 py-3 md:flex-row md:items-center md:justify-between">
            <span className="text-xs text-slate-600">
              Showing <strong>{showingFrom}</strong>–<strong>{showingTo}</strong> of{" "}
              <strong>{filtered.length}</strong> items
            </span>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-700 shadow disabled:opacity-50"
                aria-label="Previous page"
              >
                ← Prev
              </button>
              <span className="text-xs text-slate-600">
                Page {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-700 shadow disabled:opacity-50"
                aria-label="Next page"
              >
                Next →
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-2 rounded-2xl border border-white/30 bg-gradient-to-r from-white/10 via-white/5 to-white/10 py-4 text-center backdrop-blur">
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
