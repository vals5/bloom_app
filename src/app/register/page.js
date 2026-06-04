"use client";

import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Registro enviado");
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-bg px-4 py-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-primary p-8 shadow-xl">
        
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white text-main text-xl font-bold shadow-md">
            Bloom
          </div>
          <h2 className="mt-4 text-2xl font-bold text-bg">Creá tu cuenta</h2>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          
          <div>
            <label className="block text-sm font-bold text-bg mb-1">Nombre completo</label>
            <input 
              type="text" 
              required 
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 outline-none transition focus:border-main-text focus:ring-2 focus:ring-found-color/20" 
              placeholder="Juan Pérez" 
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-bg mb-1">Telefóno (con código de área)</label>
            <input 
              type="tel" 
              required 
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 outline-none transition focus:border-main-text focus:ring-2 focus:ring-found-color/20" 
              placeholder="2615555555" 
            />
            <span className="text-[11px] text-bg mt-1 block">Es importante para que te contacten directamente por tus reportes.</span>
          </div>

          <div>
            <label className="block text-sm font-bold text-bg mb-1">Correo electrónico</label>
            <input 
              type="email" 
              required 
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 outline-none transition focus:border-main-text focus:ring-2 focus:ring-found-color/20" 
              placeholder="tu@correo.com" 
            />
          </div>

           <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-bold text-bg">Contraseña</label>
            </div>
            <input 
              type="password" 
              required 
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 outline-none transition focus:border-main-text focus:ring-2 focus:ring-found-color/20" 
              placeholder="••••••••" 
            />
          </div>

          <button 
            type="submit" 
            className="w-full rounded-xl bg-secondary py-3 text-sm font-bold text-main-text shadow-md transition hover:opacity-90 active:scale-[0.98]"
          >
            Registrarme
          </button>
        </form>


       <p className="text-center text-sm text-bg">
          ¿Ya tenés una cuenta?{" "}
          <button 
            onClick={() => router.push("/login")} 
            className="font-semibold text-found-color hover:underline bg-transparent border-none cursor-pointer"
          >
            Iniciar sesión
          </button>
        </p>

      </div>
    </div>
  );
}