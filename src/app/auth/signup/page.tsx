"use client";

import { useState, Suspense } from "react";
import { registerUser } from "@/app/actions/register";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Trophy, UserPlus, AlertCircle } from "lucide-react";

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    }>
      <SignUpForm />
    </Suspense>
  );
}

function SignUpForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setFormError(null);
    setLoading(true);

    try {
      const res = await registerUser({ name, email, password });

      if (res.success) {
        // Auto sign-in after successful sign-up
        const signinRes = await signIn("credentials", {
          email: email.toLowerCase().trim(),
          password,
          redirect: false,
        });

        if (signinRes?.error) {
          router.push("/auth/signin");
        } else {
          router.push(callbackUrl);
          router.refresh();
        }
      } else {
        if (res.error && typeof res.error === "object") {
          setFieldErrors(res.error);
        } else {
          setFormError("S'ha produït un error al registrar el compte.");
        }
      }
    } catch (err) {
      setFormError("S'ha produït un error de xarxa.");
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
            Crea un compte
          </h1>
          <p className="text-xs text-slate-400 font-light">
            Uniu-vos per poder participar en el xat de partits
          </p>
        </div>

        {/* Form Error Alert */}
        {formError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="name" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Nom complet
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="El vostre nom"
              className="w-full rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary p-3 transition-all"
            />
            {fieldErrors.name && (
              <p className="text-[10px] text-red-400 font-semibold">{fieldErrors.name[0]}</p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Correu electrònic
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuari@exemple.cat"
              className="w-full rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary p-3 transition-all"
            />
            {fieldErrors.email && (
              <p className="text-[10px] text-red-400 font-semibold">{fieldErrors.email[0]}</p>
            )}
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
              placeholder="Mínim 6 caràcters"
              className="w-full rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary p-3 transition-all"
            />
            {fieldErrors.password && (
              <p className="text-[10px] text-red-400 font-semibold">{fieldErrors.password[0]}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/95 disabled:opacity-50 text-slate-950 font-extrabold py-3 rounded-lg text-sm transition-all shadow-lg shadow-primary/15"
          >
            {loading ? (
              <div className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            <span>Registrar-se</span>
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          <span>Ja teniu compte? </span>
          <Link href={`/auth/signin?callbackUrl=${callbackUrl}`} className="text-primary hover:underline font-semibold">
            Inicia sessió
          </Link>
        </div>
      </div>
    </div>
  );
}
