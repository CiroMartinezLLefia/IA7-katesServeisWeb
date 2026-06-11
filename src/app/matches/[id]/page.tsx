import { getMatchById } from "@/app/actions/matches";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Shield, Calendar, Play, CheckCircle2, MessageSquare, ArrowLeft } from "lucide-react";
import { CommentForm } from "@/components/CommentForm";

export const revalidate = 0;

type Props = {
  params: Promise<{ id: string }>;
};

export default async function MatchDetailPage({ params }: Props) {
  const { id } = await params;
  const match = await getMatchById(id);

  if (!match) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session?.user;

  const isLive = match.status === "LIVE";
  const isFinished = match.status === "FINISHED";

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Back button */}
      <Link
        href="/matches"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Tornar als partits
      </Link>

      {/* Main Match Card Panel */}
      <div className="glass-card rounded-2xl overflow-hidden border border-white/5 relative">
        {match.imageUrl && (
          <div className="w-full h-48 sm:h-64 relative">
            <img src={match.imageUrl} alt="Partit" className="w-full h-full object-cover opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          </div>
        )}

        <div className="p-6 sm:p-8 space-y-6 relative">
          {/* Match Meta Status Info */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <span className="text-slate-400 flex items-center gap-1.5 font-light">
              <Calendar className="w-4 h-4 text-slate-500" />
              {new Date(match.date).toLocaleDateString("ca-ES", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>

            {isLive ? (
              <span className="flex items-center gap-1.5 text-red-500 font-bold bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20 animate-pulse">
                <Play className="w-3.5 h-3.5 fill-red-500" /> EN DIRECTE
              </span>
            ) : isFinished ? (
              <span className="text-green-500 font-bold bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                PARTIT FINALITZAT
              </span>
            ) : (
              <span className="text-slate-400 font-bold bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                PROGRAMAT
              </span>
            )}
          </div>

          {/* Teams Display Grid */}
          <div className="grid grid-cols-3 items-center text-center py-4">
            {/* Home Team */}
            <div className="space-y-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-800/80 rounded-full mx-auto flex items-center justify-center border border-slate-700 shadow-md">
                {match.homeTeam.shieldUrl ? (
                  <img src={match.homeTeam.shieldUrl} alt={match.homeTeam.name} className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
                ) : (
                  <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-slate-500" />
                )}
              </div>
              <div>
                <p className="text-sm sm:text-lg font-extrabold text-slate-200">{match.homeTeam.name}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">{match.homeTeam.country}</p>
              </div>
            </div>

            {/* Scores / Status */}
            <div className="flex flex-col items-center justify-center">
              {match.status !== "SCHEDULED" ? (
                <div className="flex items-center gap-4 sm:gap-6">
                  <span className="text-4xl sm:text-5xl font-black text-slate-100">{match.homeScore}</span>
                  <span className="text-slate-600 font-light text-2xl">:</span>
                  <span className="text-4xl sm:text-5xl font-black text-slate-100">{match.awayScore}</span>
                </div>
              ) : (
                <span className="text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400">
                  VS
                </span>
              )}
            </div>

            {/* Away Team */}
            <div className="space-y-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-800/80 rounded-full mx-auto flex items-center justify-center border border-slate-700 shadow-md">
                {match.awayTeam.shieldUrl ? (
                  <img src={match.awayTeam.shieldUrl} alt={match.awayTeam.name} className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
                ) : (
                  <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-slate-500" />
                )}
              </div>
              <div>
                <p className="text-sm sm:text-lg font-extrabold text-slate-200">{match.awayTeam.name}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">{match.awayTeam.country}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Chat / Comments Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
        {/* Comment input form */}
        <div className="md:col-span-1 space-y-4">
          <div className="glass-card rounded-xl p-5 border border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span>Discussió en viu</span>
            </h3>

            {isLoggedIn ? (
              <CommentForm matchId={match.id} />
            ) : (
              <div className="space-y-3 text-center py-2">
                <p className="text-xs text-slate-400 font-light">
                  Heu d'iniciar sessió per poder participar en el xat en directe del partit.
                </p>
                <Link
                  href={`/auth/signin?callbackUrl=/matches/${match.id}`}
                  className="inline-block w-full text-center bg-slate-800 hover:bg-slate-750 text-primary font-bold px-4 py-2 rounded-lg text-xs transition-colors border border-slate-700"
                >
                  Inicia sessió ara
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Comments Feed list */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <span>Comentaris ({match.comments.length})</span>
          </h3>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {match.comments.length > 0 ? (
              match.comments.map((c) => (
                <div key={c.id} className="glass rounded-xl p-4 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-300">{c.user.name}</span>
                      <span className="text-slate-500 font-light">•</span>
                      <span className="text-slate-400">{c.user.email}</span>
                    </div>
                    <span className="text-slate-500">
                      {new Date(c.createdAt).toLocaleTimeString("ca-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 font-light leading-relaxed whitespace-pre-line">
                    {c.content}
                  </p>
                </div>
              ))
            ) : (
              <div className="glass rounded-xl p-8 border border-white/5 text-center text-slate-400 text-sm">
                Encara no hi ha comentaris. Sigues el primer a opinar!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
