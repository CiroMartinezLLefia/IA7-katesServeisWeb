"use client";

import { useState } from "react";
import { createMatch, updateMatch, deleteMatch } from "@/app/actions/matches";
import { uploadAssetAction } from "@/app/actions/upload";
import { Calendar, Plus, Pencil, Trash2, X, Upload, Check, Loader2, Shield } from "lucide-react";
import { useRouter as useNextRouter } from "next/navigation";

export function MatchesClient({ initialMatches, teams }: { initialMatches: any[]; teams: any[] }) {
  const [matches, setMatches] = useState(initialMatches);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [homeTeamId, setHomeTeamId] = useState("");
  const [awayTeamId, setAwayTeamId] = useState("");
  const [homeScore, setHomeScore] = useState<string>("");
  const [awayScore, setAwayScore] = useState<string>("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("SCHEDULED");
  const [imageUrl, setImageUrl] = useState("");
  
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const router = useNextRouter();

  // Reset form states
  const resetForm = () => {
    setHomeTeamId("");
    setAwayTeamId("");
    setHomeScore("");
    setAwayScore("");
    setDate("");
    setStatus("SCHEDULED");
    setImageUrl("");
    setEditingId(null);
    setErrors({});
    setGeneralError(null);
    setIsFormOpen(false);
  };

  // Trigger editing a match
  const startEdit = (match: any) => {
    setHomeTeamId(match.homeTeamId);
    setAwayTeamId(match.awayTeamId);
    setHomeScore(match.homeScore !== null && match.homeScore !== undefined ? String(match.homeScore) : "");
    setAwayScore(match.awayScore !== null && match.awayScore !== undefined ? String(match.awayScore) : "");
    
    // Format date for datetime-local input
    const d = new Date(match.date);
    const tzoffset = d.getTimezoneOffset() * 60000; // offset in milliseconds
    const localISOTime = (new Date(d.getTime() - tzoffset)).toISOString().slice(0, 16);
    setDate(localISOTime);
    
    setStatus(match.status);
    setImageUrl(match.imageUrl || "");
    setEditingId(match.id);
    setIsFormOpen(true);
    setErrors({});
    setGeneralError(null);
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setGeneralError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", "matches");

    try {
      const res = await uploadAssetAction(formData);
      if (res.success && res.url) {
        setImageUrl(res.url);
      } else {
        setGeneralError(res.error || "No s'ha pogut penjar la imatge.");
      }
    } catch (err) {
      setGeneralError("Error en la càrrega de la imatge del partit.");
    } finally {
      setUploading(false);
    }
  };

  // Submit match create or update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);
    setIsSubmitting(true);

    if (homeTeamId === awayTeamId) {
      setErrors({ awayTeamId: ["L'equip local i visitant han de ser diferents."] });
      setIsSubmitting(false);
      return;
    }

    const data = {
      homeTeamId,
      awayTeamId,
      homeScore: homeScore === "" ? null : parseInt(homeScore, 10),
      awayScore: awayScore === "" ? null : parseInt(awayScore, 10),
      date,
      status,
      imageUrl,
    };

    try {
      let res: any;
      if (editingId) {
        res = await updateMatch(editingId, data);
      } else {
        res = await createMatch(data);
      }

      if (res.success) {
        resetForm();
        router.refresh();
        // Force refresh table state
        if (res.match) {
          const homeT = teams.find(t => t.id === homeTeamId);
          const awayT = teams.find(t => t.id === awayTeamId);
          const matchWithTeams = {
            ...res.match,
            homeTeam: homeT,
            awayTeam: awayT,
          };
          if (editingId) {
            setMatches(matches.map(m => m.id === editingId ? matchWithTeams : m));
          } else {
            setMatches([matchWithTeams, ...matches]);
          }
        }
      } else {
        if (res.error && typeof res.error === "object") {
          setErrors(res.error as any);
        } else {
          setGeneralError(typeof res.error === "string" ? res.error : "S'ha produït un error.");
        }
      }
    } catch (err) {
      setGeneralError("Error de connexió amb el servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete a match
  const handleDelete = async (id: string, matchSummary: string) => {
    if (!confirm(`Esteu segur que voleu eliminar el partit "${matchSummary}"?`)) {
      return;
    }

    try {
      const res = await deleteMatch(id);
      if (res.success) {
        setMatches(matches.filter(m => m.id !== id));
        router.refresh();
      } else {
        alert(res.error || "No s'ha pogut eliminar el partit.");
      }
    } catch (err) {
      alert("Error de connexió al eliminar el partit.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            <span>Gestió de Partits</span>
          </h1>
          <p className="text-xs text-slate-400 font-light mt-0.5">
            Planifiqueu nous enfrontaments, modifiqueu puntuacions o en directo.
          </p>
        </div>

        {!isFormOpen && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/95 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs transition-all shadow-md shadow-primary/10"
          >
            <Plus className="w-4 h-4" />
            <span>Planificar Partit</span>
          </button>
        )}
      </div>

      {/* General Error Alert */}
      {generalError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg p-3">
          {generalError}
        </div>
      )}

      {/* Form Panel */}
      {isFormOpen && (
        <div className="glass rounded-xl p-5 border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              {editingId ? "Modificar Partit" : "Nou Partit"}
            </h2>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-200 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Home Team */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Equip Local
                </label>
                <select
                  value={homeTeamId}
                  onChange={(e) => setHomeTeamId(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-primary p-2.5 transition-all"
                >
                  <option value="">Selecciona Equip Local...</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.country})
                    </option>
                  ))}
                </select>
                {errors.homeTeamId && (
                  <p className="text-[10px] text-red-400 font-semibold">{errors.homeTeamId[0]}</p>
                )}
              </div>

              {/* Away Team */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Equip Visitant
                </label>
                <select
                  value={awayTeamId}
                  onChange={(e) => setAwayTeamId(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-primary p-2.5 transition-all"
                >
                  <option value="">Selecciona Equip Visitant...</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.country})
                    </option>
                  ))}
                </select>
                {errors.awayTeamId && (
                  <p className="text-[10px] text-red-400 font-semibold">{errors.awayTeamId[0]}</p>
                )}
              </div>

              {/* Home Score */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Gols Local
                </label>
                <input
                  type="number"
                  min="0"
                  value={homeScore}
                  disabled={status === "SCHEDULED"}
                  onChange={(e) => setHomeScore(e.target.value)}
                  placeholder="Buit si no s'ha jugat"
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:border-primary p-2.5 transition-all disabled:opacity-40"
                />
                {errors.homeScore && (
                  <p className="text-[10px] text-red-400 font-semibold">{errors.homeScore[0]}</p>
                )}
              </div>

              {/* Away Score */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Gols Visitant
                </label>
                <input
                  type="number"
                  min="0"
                  value={awayScore}
                  disabled={status === "SCHEDULED"}
                  onChange={(e) => setAwayScore(e.target.value)}
                  placeholder="Buit si no s'ha jugat"
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:border-primary p-2.5 transition-all disabled:opacity-40"
                />
                {errors.awayScore && (
                  <p className="text-[10px] text-red-400 font-semibold">{errors.awayScore[0]}</p>
                )}
              </div>

              {/* Date & Time */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Data i Hora del Partit
                </label>
                <input
                  type="datetime-local"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-primary p-2.5 transition-all"
                />
                {errors.date && <p className="text-[10px] text-red-400 font-semibold">{errors.date[0]}</p>}
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Estat del Partit
                </label>
                <select
                  value={status}
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    setStatus(newStatus);
                    if (newStatus === "SCHEDULED") {
                      setHomeScore("");
                      setAwayScore("");
                    }
                  }}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-primary p-2.5 transition-all"
                >
                  <option value="SCHEDULED">SCHEDULED (Programat)</option>
                  <option value="LIVE">LIVE (En directe)</option>
                  <option value="FINISHED">FINISHED (Finalitzat)</option>
                </select>
                {errors.status && <p className="text-[10px] text-red-400 font-semibold">{errors.status[0]}</p>}
              </div>
            </div>

            {/* Cover photo upload */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Foto de portada del partit
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt="Portada"
                    className="w-24 h-14 object-cover rounded border border-slate-850 shrink-0 bg-slate-950"
                  />
                )}
                
                <div className="flex-1 w-full">
                  <div className="relative flex items-center justify-center w-full h-12 border border-dashed border-slate-850 hover:border-primary/45 rounded-lg cursor-pointer bg-slate-950/40 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          <span>Pendant la imatge del partit...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 text-slate-500" />
                          <span>Selecciona una imatge del partit</span>
                        </>
                      )}
                    </div>
                  </div>
                  {imageUrl && (
                    <p className="text-[10px] text-green-400 font-semibold mt-1 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Foto de portada desada!
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="bg-slate-850 hover:bg-slate-800 text-slate-300 font-bold px-4 py-2 rounded-lg text-xs transition-colors"
              >
                Cancel·lar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || uploading}
                className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-slate-950 font-bold px-5 py-2 rounded-lg text-xs transition-all shadow-md shadow-primary/10"
              >
                {isSubmitting ? "Planificant..." : editingId ? "Desar canvis" : "Planificar partit"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Matches Grid List */}
      <div className="glass rounded-xl overflow-hidden border border-white/5">
        {matches.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-slate-900/50 text-slate-400 uppercase font-semibold tracking-wider">
                  <th className="p-4">Partit</th>
                  <th className="p-4 text-center">Resultat</th>
                  <th className="p-4">Estat</th>
                  <th className="p-4">Data del partit</th>
                  <th className="p-4 text-right">Accions</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((m) => {
                  const matchSummary = `${m.homeTeam.name} vs ${m.awayTeam.name}`;
                  return (
                    <tr key={m.id} className="border-b border-white/5 hover:bg-slate-850/20 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2 font-bold text-slate-200">
                          <span className="truncate max-w-[120px]">{m.homeTeam.name}</span>
                          <span className="text-slate-500 font-normal">vs</span>
                          <span className="truncate max-w-[120px]">{m.awayTeam.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        {m.status !== "SCHEDULED" ? (
                          <span className="bg-slate-950 font-mono font-bold text-slate-100 px-2.5 py-1 rounded border border-slate-800">
                            {m.homeScore} - {m.awayScore}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">Programat</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] tracking-wider uppercase ${
                          m.status === "LIVE"
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : m.status === "FINISHED"
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400">
                        {new Date(m.date).toLocaleDateString("ca-ES", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex gap-1.5">
                          <button
                            onClick={() => startEdit(m)}
                            className="p-2 text-slate-400 hover:text-primary hover:bg-slate-800/40 rounded-lg transition-colors border border-transparent hover:border-slate-800"
                            title="Modificar"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(m.id, matchSummary)}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-slate-800"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 italic">No hi ha partits planificats.</div>
        )}
      </div>
    </div>
  );
}
