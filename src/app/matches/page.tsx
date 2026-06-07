import { db } from "@/lib/db";
import Link from "next/link";
import { Calendar, Play, CheckCircle2, ChevronRight, Shield } from "lucide-react";

export const revalidate = 0;

export default async function MatchesPage() {
  const matches = await db.match.findMany({
    include: {
      homeTeam: true,
      awayTeam: true,
    },
    orderBy: { date: "desc" },
  });

  const live = matches.filter((m) => m.status === "LIVE");
  const scheduled = matches.filter((m) => m.status === "SCHEDULED");
  const finished = matches.filter((m) => m.status === "FINISHED");

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100 uppercase tracking-wide flex items-center gap-2">
          <Calendar className="w-8 h-8 text-primary" />
          <span>Calendari de Partits</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Exploreu els partits finalitzats, en directe i propers enfrontaments.
        </p>
      </div>

      {/* 1. Live Matches Section */}
      {live.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-red-500 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span>En Directe</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {live.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </div>
      )}

      {/* 2. Upcoming / Scheduled Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <span>Propers Partits</span>
        </h2>
        {scheduled.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scheduled.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic">No hi ha partits programats.</p>
        )}
      </div>

      {/* 3. Finished Matches Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span>Partits Finalitzats</span>
        </h2>
        {finished.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {finished.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic">No hi ha partits finalitzats.</p>
        )}
      </div>
    </div>
  );
}

function MatchCard({ match }: { match: any }) {
  const isLive = match.status === "LIVE";
  const isFinished = match.status === "FINISHED";

  return (
    <Link
      href={`/matches/${match.id}`}
      className={`glass-card rounded-xl p-5 border border-white/5 block hover:scale-[1.01] transition-all relative ${
        isLive ? "hover:border-red-500/20" : isFinished ? "hover:border-green-500/20" : "hover:border-primary/20"
      }`}
    >
      <div className="flex items-center justify-between text-xs mb-4">
        {isLive ? (
          <span className="flex items-center gap-1.5 text-red-500 font-bold bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
            <Play className="w-3 h-3 fill-red-500" /> DIRECTE
          </span>
        ) : isFinished ? (
          <span className="text-green-500 font-semibold bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
            FINALITZAT
          </span>
        ) : (
          <span className="text-slate-400 font-semibold bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
            PROGRAMAT
          </span>
        )}
        <span className="text-slate-400 font-light">
          {new Date(match.date).toLocaleDateString("ca-ES", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      <div className="grid grid-cols-3 items-center text-center">
        {/* Home Team */}
        <div className="space-y-1">
          <div className="w-10 h-10 bg-slate-800 rounded-full mx-auto flex items-center justify-center border border-slate-700 shadow-md">
            {match.homeTeam.shieldUrl ? (
              <img src={match.homeTeam.shieldUrl} alt="" className="w-6 h-6 object-contain" />
            ) : (
              <Shield className="w-5 h-5 text-slate-500" />
            )}
          </div>
          <p className="text-xs font-bold text-slate-200 truncate">{match.homeTeam.name}</p>
        </div>

        {/* Score / VS */}
        <div className="flex flex-col items-center justify-center">
          {match.status !== "SCHEDULED" ? (
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-slate-100">{match.homeScore}</span>
              <span className="text-slate-500 font-light">-</span>
              <span className="text-2xl font-black text-slate-100">{match.awayScore}</span>
            </div>
          ) : (
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-400">
              VS
            </span>
          )}
        </div>

        {/* Away Team */}
        <div className="space-y-1">
          <div className="w-10 h-10 bg-slate-800 rounded-full mx-auto flex items-center justify-center border border-slate-700 shadow-md">
            {match.awayTeam.shieldUrl ? (
              <img src={match.awayTeam.shieldUrl} alt="" className="w-6 h-6 object-contain" />
            ) : (
              <Shield className="w-5 h-5 text-slate-500" />
            )}
          </div>
          <p className="text-xs font-bold text-slate-200 truncate">{match.awayTeam.name}</p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 flex justify-end items-center gap-1 text-[10px] text-slate-400 hover:text-primary transition-colors">
        <span>Veure comentaris i detalls</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </div>
    </Link>
  );
}
