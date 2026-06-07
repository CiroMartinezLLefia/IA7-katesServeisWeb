"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { LogOut, Settings, LogIn, UserPlus } from "lucide-react";

export function UserNav() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    );
  }

  if (session && session.user) {
    const role = session.user.role;
    const canAccessBackoffice = role === "ADMIN" || role === "EDITOR";

    return (
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-slate-200">{session.user.name}</p>
          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
            role === "ADMIN" 
              ? "bg-red-500/20 text-red-400 border border-red-500/30"
              : role === "EDITOR"
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
          }`}>
            {role}
          </span>
        </div>
        
        {canAccessBackoffice && (
          <Link
            href="/backoffice/teams"
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-primary transition-colors py-1 px-3 rounded-md border border-slate-700 bg-slate-800/50"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Panell</span>
          </Link>
        )}

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800/50 rounded-lg transition-all border border-transparent hover:border-slate-700"
          title="Tanca la sessió"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/auth/signin"
        className="flex items-center gap-1 text-sm font-medium text-slate-300 hover:text-primary transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-800/40"
      >
        <LogIn className="w-4 h-4" />
        <span>Inicia sessió</span>
      </Link>
      <Link
        href="/auth/signup"
        className="flex items-center gap-1 text-sm font-semibold bg-primary hover:bg-primary/90 text-slate-950 transition-all py-1.5 px-4 rounded-lg shadow-md shadow-primary/20"
      >
        <UserPlus className="w-4 h-4" />
        <span>Registra't</span>
      </Link>
    </div>
  );
}
