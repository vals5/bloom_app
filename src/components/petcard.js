"use client";
 
import { useState } from "react";
import { Heart, MapPin } from "lucide-react";
import Image from "next/image";

export default function PetCard ({ pet }) {
    const [ isFavorite, isSetFavorite ] = useState (false);

    const statusStyles = {
        lost: { label: "PERDIDO", bg: "bg-lost"},
        found: { label: "ENCONTRADO", bg: "bg-found"},
        adopt: { label: "ADOPTAR", bg: "bg-adopt"}
    };

    return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-5">
      {/* IMG CONTAINER */}
      <div className="relative aspect-[4/3] w-full bg-gray-100 flex items-center justify-center text-gray-400">
        {pet.imageUrl ? (
          <Image 
            src={pet.imageUrl} 
            alt={pet.name} 
            fill 
            className="object-cover" 
          />
        ) : (
          <svg className="w-16 h-16 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}

        {/* STATUS BADGE */}
        <span className={`absolute top-4 left-4 text-[10px] font-black text-white px-3 py-1 rounded-full ${statusStyles[pet.status]?.bg || 'bg-gray-500'}`}>
          {statusStyles[pet.status]?.label || 'DESCONOCIDO'}
        </span>

        {/* FAV BUTTON */}
        <button 
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-4 right-4 p-2 bg-white/40 backdrop-blur-md rounded-full shadow-sm hover:scale-105 active:scale-[0.95] transition-all"
        >
          <Heart className={`w-5 h-5 transition-colors ${isFavorite ? "fill-lost text-lost" : "text-white"}`} />
        </button>
      </div>

      {/* INFO BODY */}
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-baseline">
          <h3 className="text-xl font-bold text-main-text font-quicksand">{pet.name}</h3>
          <span className="text-xs font-semibold text-subt-text/60">{pet.date}</span>
        </div>

        <div className="flex items-center gap-1 text-xs font-semibold text-subt-text/80">
          <MapPin className="w-4 h-4 text-primary" />
          <span>{pet.location}</span>
        </div>

        {/* TAGS */}
        <div className="flex gap-2 pt-1">
          <span className="px-3 py-1 bg-gray-100 text-subt-text/80 text-xs font-bold rounded-full">
            {pet.gender}
          </span>
          <span className="px-3 py-1 bg-gray-100 text-subt-text/80 text-xs font-bold rounded-full">
            {pet.size}
          </span>
        </div>
      </div>
    </div>
  );
}