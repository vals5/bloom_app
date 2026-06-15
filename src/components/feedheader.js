"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";

export default function FeedHeader() {
  const [activeTab, setActiveTab] = useState("lost-found");
  const [activeFilter, setActiveFilter] = useState("Todos");

  const quickFilters = ["Perros", "Gatos", "Urgente"];

  return (
    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm pt-4 pb-3 px-4 space-y-4 border-b border-gray-100">
      {/* Top App Bar */}
      <div className="flex items-center justify-between">
        <button className="p-1 text-primary">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-xl font-bold tracking-wider text-primary font-quicksand">BLOOM</h1>
        <div className="w-8 h-8 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center text-xs font-bold text-subt-text">
          U
        </div>
      </div>

      {/* Selector Principal (Tabs) */}
      <div className="flex bg-gray-100 p-1 rounded-2xl">
        <button
          onClick={() => setActiveTab("lost-found")}
          className={`flex-1 py-2.5 text-center text-xs font-bold rounded-xl transition-all ${
            activeTab === "lost-found"
              ? "bg-white text-primary shadow-sm"
              : "text-subt-text/70 hover:text-subt-text"
          }`}
        >
          Perdidos y Encontrados
        </button>
        <button
          onClick={() => setActiveTab("adoptions")}
          className={`flex-1 py-2.5 text-center text-xs font-bold rounded-xl transition-all ${
            activeTab === "adoptions"
              ? "bg-white text-primary shadow-sm"
              : "text-subt-text/70 hover:text-subt-text"
          }`}
        >
          Adopciones
        </button>
      </div>

      {/* Filtros rápidos */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-white text-xs font-bold whitespace-nowrap">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filtros
        </button>
        
        {/* Renderizado seguro: Evaluamos directo el .map sin && previos que rompan todo */}
        {quickFilters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-1.5 rounded-full border text-xs font-semibold transition-colors whitespace-nowrap ${
              activeFilter === filter
                ? "bg-primary/10 border-primary text-primary"
                : "border-gray-200 bg-white text-subt-text"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
}