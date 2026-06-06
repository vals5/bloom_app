"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    if (!email || !password || !name || !whatsapp) {
      setErrorMsg("Por favor, completá todos los campos.");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: name,
            whatsapp: whatsapp,
          },
        },
      });

      if (error) throw error;

      alert("¡Registro exitoso! Ya podés iniciar sesión.");
      router.push("/login"); 
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
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

        {errorMsg && (
          <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600 font-semibold border border-red-200">
            {errorMsg}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleRegister}>
          
          <div>
            <label className="block text-sm font-bold text-bg mb-1">Nombre completo</label>
            <input 
              type="text" 
              required 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 outline-none transition focus:border-main-text focus:ring-2 focus:ring-found-color/20" 
              placeholder="Juan Pérez" 
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-bg mb-1">Telefóno (con código de área)</label>
            <input 
              type="tel" 
              required 
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            {loading ? "Registrando..." : "Registrarme"}
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