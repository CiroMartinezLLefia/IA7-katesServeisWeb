"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Trophy, LogIn, AlertCircle } from "lucide-react";

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || !password) {
      setError("Si us plau, ompliu tots els camps.");
      setLoading(false);
      return;
    }

    try {
      const res = await signIn("credentials", {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Correu electrònic o contrasenya incorrectes.");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError("S'ha produït un error de connexió.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center py-6">
      <div className="w-full max-w-md glass-card rounded-2xl p-8 border border-white/5 space-y-6">
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 mx-auto">
            <Trophy className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <h1 className="text-2xl font-black uppercase text-slate-100 glow-text-gold tracking-wide">
            Inicia Sessió
          </h1>
          <p className="text-xs text-slate-400 font-light">
            Accediu a la plataforma Champions SaaS
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Correu electrònic
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuari@champions.local"
              className="w-full rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary p-3 transition-all"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Contrasenya
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary p-3 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/95 disabled:opacity-50 text-slate-950 font-extrabold py-3 rounded-lg text-sm transition-all shadow-lg shadow-primary/15"
          >
            {loading ? (
              <div className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            <span>Entrar</span>
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-400">
          <span>No teniu compte? </span>
          <Link href={`/auth/signup?callbackUrl=${callbackUrl}`} className="text-primary hover:underline font-semibold">
            Registra't gratis
          </Link>
        </div>

        {/* Demo credentials help box */}
        <div className="text-[10px] bg-slate-900/60 border border-slate-800 rounded-lg p-3 space-y-1 text-slate-500">
          <p className="font-bold text-slate-400">Comptes de demostració:</p>
          <p>• Admin: <code className="text-primary">admin@champions.local</code> / <code className="text-slate-300">admin123</code></p>
          <p>• Editor: <code className="text-amber-400">editor@champions.local</code> / <code className="text-slate-300">editor123</code></p>
          <p>• Usuari: <code className="text-blue-400">user@champions.local</code> / <code className="text-slate-300">user123</code></p>
        </div>
      </div>
    </div>
  );
}
