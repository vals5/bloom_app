"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, Search, PlusCircle, User } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { label: "Inicio", icon: Home, path: "/feed" },
    { label: "Buscar", icon: Search, path: "/search" },
    { label: "Crear", icon: PlusCircle, path: "/create" },
    { label: "Perfil", icon: User, path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white pb-safe shadow-lg">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center justify-center gap-1 w-12 h-12 transition-colors ${
                isActive ? "text-primary" : "text-mode"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}