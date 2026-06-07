import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Shield, Calendar, Users, LayoutDashboard, ArrowLeft } from "lucide-react";

export default async function BackofficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/signin");
  }

  const role = session.user.role;
  const isAdmin = role === "ADMIN";

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      {/* Backoffice Sidebar Navigation */}
      <aside className="md:col-span-1 space-y-4">
        <div className="glass-card rounded-xl p-5 border border-white/5 space-y-4">
          <div className="space-y-1">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1">
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Panell de Control</span>
            </h2>
            <p className="text-[10px] text-slate-400 font-light truncate">
              Sessió com a <span className="text-primary font-bold">{session.user.name}</span>
            </p>
          </div>

          <hr className="border-white/5" />

          <nav className="flex flex-col gap-1 text-sm">
            <Link
              href="/backoffice/teams"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-primary hover:bg-slate-800/40 transition-all font-medium"
            >
              <Shield className="w-4 h-4" />
              <span>Gestió d'Equips</span>
            </Link>
            <Link
              href="/backoffice/matches"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-primary hover:bg-slate-800/40 transition-all font-medium"
            >
              <Calendar className="w-4 h-4" />
              <span>Gestió de Partits</span>
            </Link>

            {isAdmin && (
              <Link
                href="/backoffice/users"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-primary hover:bg-slate-800/40 transition-all font-medium"
              >
                <Users className="w-4 h-4" />
                <span>Gestió d'Usuaris</span>
              </Link>
            )}
          </nav>

          <hr className="border-white/5" />

          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors px-3 py-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Tornar a la web pública</span>
          </Link>
        </div>
      </aside>

      {/* Main Backoffice Panel Content Area */}
      <main className="md:col-span-3 glass-card rounded-xl p-6 sm:p-8 border border-white/5">
        {children}
      </main>
    </div>
  );
}
