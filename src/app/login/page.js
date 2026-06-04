"use client";

import { useRouter } from "next/navigation";

export default function LoginScreen() {
  const router = useRouter();

  return (
    <div className="flex h-screen w-full items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-primary p-8 shadow-xl border border-gray-100">
        
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white text- text-xl font-bold shadow-md">
            Bloom
          </div>
        </div>

        <form className="mt-8 space-y-4" onSubmit={(e) => e.preventDefault()}>
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
              <a href="#" className="text-xs font-bold text-found-color hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
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
            Iniciar sesión
          </button>
        </form>

        <div className="relative flex items-center justify-center py-2">
          <span className="absolute px-3 text-xs text-bg uppercase">o continuar con</span>
        </div>

        <button type="button" className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-[0.98]">
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.107C18.216 1.714 15.467 1 12.24 1c-6.077 0-11 4.923-11 11s4.923 11 11 11c6.346 0 10.557-4.444 10.557-10.74 0-.722-.078-1.275-.173-1.685H12.24z" />
          </svg>
          Iniciar con Google
        </button>

        <p className="text-center text-sm text-bg">
          ¿No tenés una cuenta?{" "}
          <button 
            onClick={() => router.push("/register")} 
            className="font-semibold text-found-color hover:underline bg-transparent border-none cursor-pointer"
          >
            Crear cuenta
          </button>
        </p>
      </div>
    </div>
  );
}