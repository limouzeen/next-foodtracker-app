
import Image from "next/image";
import Link from "next/link";

// import รูปจาก src/images
import food from "./images/food.jpg";
import foodbanner from "./images/foodbanner.jpg";
import profile from "./images/profile.jpg";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-300 via-fuchsia-300 to-pink-300">
      <main className="mx-auto flex max-w-5xl flex-col items-center justify-center px-6 py-16 text-center">
        {/* ข้อความหลัก */}
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white drop-shadow md:text-6xl">
          Welcome to Food Tracker
        </h1>
        <p className="mb-10 text-lg text-white/95 md:text-2xl">
          Track your meal!!!
        </p>

        {/* Hero Image */}
        <div className="relative mb-10 h-64 w-64 md:h-80 md:w-80 overflow-hidden rounded-3xl shadow-2xl ring-4 ring-white/40">
          <Image
            src={foodbanner}
            alt="Food Tracker banner"
            fill
            className="object-cover transition-transform duration-500 hover:scale-105"
            priority
          />
        </div>

        {/* ปุ่ม */}
        <div className="flex flex-col gap-4 md:flex-row md:gap-6">
          <Link
            href="/register"
            className="rounded-xl bg-white/90 px-10 py-3 text-lg font-semibold text-blue-600 shadow-lg backdrop-blur-sm transition-transform duration-300 hover:scale-105 hover:bg-white focus:outline-none focus:ring-4 focus:ring-blue-200"
          >
            Register
          </Link>
          <Link
            href="/login"
            className="rounded-xl bg-white/90 px-10 py-3 text-lg font-semibold text-pink-600 shadow-lg backdrop-blur-sm transition-transform duration-300 hover:scale-105 hover:bg-white focus:outline-none focus:ring-4 focus:ring-pink-200"
          >
            Login
          </Link>
        </div>

        {/* รูปประกอบเพิ่มเติม */}
        <div className="mt-12 grid grid-cols-3 gap-6">
          <div className="relative h-24 w-24 overflow-hidden rounded-full shadow-lg ring-4 ring-white/50">
            <Image src={food} alt="Food" fill className="object-cover" />
          </div>
          <div className="relative h-24 w-24 overflow-hidden rounded-full shadow-lg ring-4 ring-white/50">
            <Image src={foodbanner} alt="Food banner" fill className="object-cover" />
          </div>
          <div className="relative h-24 w-24 overflow-hidden rounded-full shadow-lg ring-4 ring-white/50">
            <Image src={profile} alt="Profile" fill className="object-cover" />
          </div>
        </div>
      </main>

            {/* Footer */}
      <footer className="mt-12 border-t border-white/30 bg-gradient-to-r from-white/10 via-white/5 to-white/10 py-6">
        <p className="text-center text-sm font-light tracking-wider text-white/70">
          © ฺ By {new Date().getFullYear()}{" "}
          <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text font-semibold text-transparent">
            Amarat
          </span>{" "}
          · All Rights Reserved
        </p>
      </footer>

    </div>
  );
}
