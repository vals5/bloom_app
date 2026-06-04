"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SplashScreen(){
  const router = useRouter();

  useEffect (() => {
    const timer = setTimeout(() => {
      router.push("/login");
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#F3F4F6]">
      <div className="animate-pulse text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#3B82F6] text-white text-2xl font-bold shadow-lg">
          Bloom
        </div>
        <h1 className="mt-4 text-xl font-semibold text-[#1F2937] tracking-wide">Bloom</h1>
      </div>
    </div>
  );
}