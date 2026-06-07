import { db } from "@/lib/db";
import { Shield } from "lucide-react";

export const revalidate = 0;

export default async function TeamsPage() {
  const teams = await db.team.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100 uppercase tracking-wide flex items-center gap-2">
          <Shield className="w-8 h-8 text-primary" />
          <span>Directori d'Equips</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Llista completa de clubs que participen en la competició.
        </p>
      </div>

      {teams.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {teams.map((t) => (
            <div
              key={t.id}
              className="glass-card rounded-xl p-6 border border-white/5 flex flex-col items-center justify-center text-center gap-4 group"
            >
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 shadow-md group-hover:scale-105 transition-transform duration-300">
                {t.shieldUrl ? (
                  <img src={t.shieldUrl} alt={t.name} className="w-12 h-12 object-contain" />
                ) : (
                  <Shield className="w-10 h-10 text-slate-500" />
                )}
              </div>
              <div className="space-y-1">
                <h2 className="font-bold text-base text-slate-200 group-hover:text-primary transition-colors">
                  {t.name}
                </h2>
                <p className="text-xs text-slate-500 uppercase tracking-wider">{t.country || "Sense país"}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass rounded-xl p-12 border border-white/5 text-center text-slate-400">
          No s'ha trobat cap equip a la base de dades.
        </div>
      )}
    </div>
  );
}
