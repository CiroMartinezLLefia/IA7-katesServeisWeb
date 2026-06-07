import { db } from "@/lib/db";
import Link from "next/link";
import { Shield, Calendar, Trophy, ArrowRight, Play, CheckCircle2 } from "lucide-react";

export const revalidate = 0; // Disable static rendering for direct DB stats

export default async function HomePage() {
  // Fetch stats and matches in parallel
  const [teamsCount, matchesCount, finishedCount, liveMatches, upcomingMatches, featuredTeams] = await Promise.all([
    db.team.count(),
    db.match.count(),
    db.match.count({ where: { status: "FINISHED" } }),
    db.match.findMany({
      where: { status: "LIVE" },
      include: { homeTeam: true, awayTeam: true },
      orderBy: { date: "desc" },
    }),
    db.match.findMany({
      where: { status: "SCHEDULED" },
      include: { homeTeam: true, awayTeam: true },
      orderBy: { date: "asc" },
      take: 3,
    }),
    db.team.findMany({
      take: 4,
    }),
  ]);

  return (
    <div className="space-y-12">
      {/* Hero Banner Section */}
      <section className="relative rounded-2xl overflow-hidden glass p-8 sm:p-12 border border-white/5 flex flex-col justify-center min-h-[300px]">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/60 via-slate-950/80 to-transparent z-0" />
        <div className="relative z-10 max-w-xl space-y-4">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
            <Trophy className="w-3 h-3" /> IA7 Kates Serveis Web
          </span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-100 uppercase glow-text-blue leading-tight">
            Plataforma <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-yellow-400 to-yellow-600 glow-text-gold">
              Champions SaaS
            </span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-md font-light leading-relaxed">
            Consulteu partits, equips i classificació. Registreu-vos per interactuar publicant comentaris en viu als partits de futbol.
          </p>
          <div className="pt-2 flex flex-wrap gap-4">
            <Link
              href="/matches"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/95 text-slate-950 font-bold px-5 py-2.5 rounded-lg text-sm transition-all shadow-lg shadow-primary/20 hover:scale-[1.02]"
            >
              <span>Veure Partits</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/teams"
              className="inline-flex items-center gap-2 border border-slate-700 bg-slate-800/40 hover:bg-slate-800/60 text-slate-200 px-5 py-2.5 rounded-lg text-sm transition-all hover:scale-[1.02]"
            >
              <Shield className="w-4 h-4" />
              <span>Explorar Equips</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card rounded-xl p-6 border border-white/5 flex flex-col justify-between gap-2">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Equips Registrats</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-100">{teamsCount}</span>
            <Shield className="w-5 h-5 text-primary" />
          </div>
        </div>
        <div className="glass-card rounded-xl p-6 border border-white/5 flex flex-col justify-between gap-2">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Partits seeded</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-100">{matchesCount}</span>
            <Calendar className="w-5 h-5 text-accent" />
          </div>
        </div>
        <div className="glass-card rounded-xl p-6 border border-white/5 flex flex-col justify-between gap-2">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Partits Finalitzats</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-100">{finishedCount}</span>
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </div>
        </div>
      </section>

      {/* Matches Overview */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Live Matches Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>Partits en Viu</span>
            </h2>
            <Link href="/matches" className="text-xs text-primary hover:underline flex items-center gap-1">
              <span>Tots</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {liveMatches.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {liveMatches.map((m) => (
                <Link
                  key={m.id}
                  href={`/matches/${m.id}`}
                  className="glass-card rounded-xl p-6 border border-white/5 hover:border-red-500/20 block"
                >
                  <div className="flex items-center justify-between text-xs text-red-500 font-bold mb-4">
                    <span className="flex items-center gap-1.5 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/25">
                      <Play className="w-3.5 h-3.5 fill-red-500" /> EN DIRECTE
                    </span>
                    <span className="text-slate-400 font-light">
                      {new Date(m.date).toLocaleDateString("ca-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 items-center text-center">
                    <div className="space-y-2">
                      <div className="w-12 h-12 bg-slate-800 rounded-full mx-auto flex items-center justify-center border border-slate-700 shadow-md">
                        {m.homeTeam.shieldUrl ? (
                          <img src={m.homeTeam.shieldUrl} alt={m.homeTeam.name} className="w-8 h-8 object-contain" />
                        ) : (
                          <Shield className="w-6 h-6 text-slate-500" />
                        )}
                      </div>
                      <p className="text-sm font-bold text-slate-200 truncate">{m.homeTeam.name}</p>
                    </div>

                    <div className="flex items-center justify-center gap-4">
                      <span className="text-3xl font-black text-slate-100">{m.homeScore}</span>
                      <span className="text-slate-500 font-light">:</span>
                      <span className="text-3xl font-black text-slate-100">{m.awayScore}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="w-12 h-12 bg-slate-800 rounded-full mx-auto flex items-center justify-center border border-slate-700 shadow-md">
                        {m.awayTeam.shieldUrl ? (
                          <img src={m.awayTeam.shieldUrl} alt={m.awayTeam.name} className="w-8 h-8 object-contain" />
                        ) : (
                          <Shield className="w-6 h-6 text-slate-500" />
                        )}
                      </div>
                      <p className="text-sm font-bold text-slate-200 truncate">{m.awayTeam.name}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="glass rounded-xl p-8 border border-white/5 text-center text-slate-400 text-sm">
              No hi ha cap partit en directe en aquest moment.
            </div>
          )}
        </div>

        {/* Upcoming Fixtures Panel */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Propers Fixtures</span>
            </h2>
          </div>

          <div className="space-y-4">
            {upcomingMatches.length > 0 ? (
              upcomingMatches.map((m) => (
                <Link
                  key={m.id}
                  href={`/matches/${m.id}`}
                  className="glass-card rounded-xl p-4 border border-white/5 block hover:border-primary/20"
                >
                  <p className="text-[10px] text-slate-400 mb-2 font-medium">
                    {new Date(m.date).toLocaleDateString("ca-ES", {
                      weekday: "short",
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 shrink-0">
                        {m.homeTeam.shieldUrl ? (
                          <img src={m.homeTeam.shieldUrl} alt="" className="w-4 h-4 object-contain" />
                        ) : (
                          <Shield className="w-3.5 h-3.5 text-slate-500" />
                        )}
                      </div>
                      <span className="text-xs font-bold text-slate-200 truncate">{m.homeTeam.name}</span>
                    </div>

                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono shrink-0">
                      VS
                    </span>

                    <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
                      <span className="text-xs font-bold text-slate-200 truncate">{m.awayTeam.name}</span>
                      <div className="w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 shrink-0">
                        {m.awayTeam.shieldUrl ? (
                          <img src={m.awayTeam.shieldUrl} alt="" className="w-4 h-4 object-contain" />
                        ) : (
                          <Shield className="w-3.5 h-3.5 text-slate-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="glass rounded-xl p-6 border border-white/5 text-center text-slate-400 text-sm">
                No hi ha partits programats.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Teams Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
            <Shield className="w-4 h-4 text-slate-400" />
            <span>Equips Destacats</span>
          </h2>
          <Link href="/teams" className="text-xs text-primary hover:underline flex items-center gap-1">
            <span>Tots</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {featuredTeams.map((t) => (
            <div key={t.id} className="glass-card rounded-xl p-6 border border-white/5 text-center flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 shadow-lg relative">
                {t.shieldUrl ? (
                  <img src={t.shieldUrl} alt={t.name} className="w-10 h-10 object-contain" />
                ) : (
                  <Shield className="w-8 h-8 text-slate-500" />
                )}
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-200 truncate max-w-full">{t.name}</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{t.country || "N/A"}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
