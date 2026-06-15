"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleEmailLogin = async (e) => {
    e.preventDefault(); 
    setLoading(true);
    setErrorMsg("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;

      router.push("/feed");
    } catch (error) {
      setErrorMsg("Credenciales inválidas. Revisá tu correo o contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-primary p-8 shadow-xl border border-gray-100">
        
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white text-main-text text-xl font-bold shadow-md">
            Bloom
          </div>
        </div>

        {errorMsg && (
          <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600 font-semibold border border-red-200">
            {errorMsg}
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleEmailLogin}>
          <div>
            <label className="block text-sm font-bold text-bg mb-1">Correo electrónico</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 outline-none transition focus:border-main-text focus:ring-2 focus:ring-found-color/20" 
              placeholder="tu@correo.com" 
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-bold text-bg">Contraseña</label>
              <a href="#" className="text-xs font-bold text-bg hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 outline-none transition focus:border-main-text focus:ring-2 focus:ring-found-color/20" 
              placeholder="••••••••" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full rounded-xl bg-secondary py-3 text-sm font-bold text-main-text shadow-md transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>
        
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