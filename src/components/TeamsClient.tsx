"use client";

import { useState } from "react";
import { createTeam, updateTeam, deleteTeam } from "@/app/actions/teams";
import { uploadAssetAction } from "@/app/actions/upload";
import { Shield, Plus, Pencil, Trash2, X, Upload, Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function TeamsClient({ initialTeams }: { initialTeams: any[] }) {
  const [teams, setTeams] = useState(initialTeams);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [shieldUrl, setShieldUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const router = useRouter();

  // Reset form states
  const resetForm = () => {
    setName("");
    setCountry("");
    setShieldUrl("");
    setEditingId(null);
    setErrors({});
    setGeneralError(null);
    setIsFormOpen(false);
  };

  // Trigger editing a team
  const startEdit = (team: any) => {
    setName(team.name);
    setCountry(team.country || "");
    setShieldUrl(team.shieldUrl || "");
    setEditingId(team.id);
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
    formData.append("bucket", "teams");

    try {
      const res = await uploadAssetAction(formData);
      if (res.success && res.url) {
        setShieldUrl(res.url);
      } else {
        setGeneralError(res.error || "No s'ha pogut penjar la imatge.");
      }
    } catch (err) {
      setGeneralError("Error en la càrrega de la imatge.");
    } finally {
      setUploading(false);
    }
  };

  // Submit team create or update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);
    setIsSubmitting(true);

    const data = { name, country, shieldUrl };

    try {
      let res: any;
      if (editingId) {
        res = await updateTeam(editingId, data);
      } else {
        res = await createTeam(data);
      }

      if (res.success) {
        resetForm();
        router.refresh();
        // Since router.refresh() updates RSC in background, we update state locally as well for instantaneous UI response
        if (editingId) {
          setTeams(teams.map(t => t.id === editingId ? { ...t, ...data } : t));
        } else if (res.team) {
          setTeams([...teams, res.team]);
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

  // Delete a team
  const handleDelete = async (id: string, teamName: string) => {
    if (!confirm(`Esteu segur que voleu eliminar l'equip "${teamName}"?`)) {
      return;
    }

    try {
      const res = await deleteTeam(id);
      if (res.success) {
        setTeams(teams.filter(t => t.id !== id));
        router.refresh();
      } else {
        alert(res.error || "No s'ha pogut eliminar l'equip.");
      }
    } catch (err) {
      alert("Error de connexió al eliminar l'equip.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Toggle Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <span>Gestió d'Equips</span>
          </h1>
          <p className="text-xs text-slate-400 font-light mt-0.5">
            Crea, edita o elimina equips de la competició.
          </p>
        </div>

        {!isFormOpen && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/95 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs transition-all shadow-md shadow-primary/10"
          >
            <Plus className="w-4 h-4" />
            <span>Afegir Equip</span>
          </button>
        )}
      </div>

      {/* General Error Alert */}
      {generalError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg p-3">
          {generalError}
        </div>
      )}

      {/* Create / Edit Form */}
      {isFormOpen && (
        <div className="glass rounded-xl p-5 border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              {editingId ? "Modificar Equip" : "Nou Equip"}
            </h2>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-200 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Nom de l'equip
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex. Real Madrid CF"
                className="w-full rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:border-primary p-2.5 transition-all"
              />
              {errors.name && <p className="text-[10px] text-red-400 font-semibold">{errors.name[0]}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                País
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Ex. Espanya"
                className="w-full rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:border-primary p-2.5 transition-all"
              />
              {errors.country && <p className="text-[10px] text-red-400 font-semibold">{errors.country[0]}</p>}
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Escut / Logo (Imatge)
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Shield Preview */}
                <div className="w-16 h-16 bg-slate-950 rounded-full flex items-center justify-center border border-slate-800 shrink-0">
                  {shieldUrl ? (
                    <img src={shieldUrl} alt="Escut" className="w-10 h-10 object-contain" />
                  ) : (
                    <Shield className="w-8 h-8 text-slate-600" />
                  )}
                </div>

                {/* Upload Action */}
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
                          <span>Pendant la imatge...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 text-slate-500" />
                          <span>Feu clic per seleccionar un fitxer de logo</span>
                        </>
                      )}
                    </div>
                  </div>
                  {shieldUrl && (
                    <p className="text-[10px] text-green-400 font-semibold mt-1 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Escut penjat correctament!
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
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
                {isSubmitting ? "Desant..." : editingId ? "Guardar canvis" : "Crear equip"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Teams Grid / Table */}
      <div className="glass rounded-xl overflow-hidden border border-white/5">
        {teams.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-slate-900/50 text-slate-400 uppercase font-semibold tracking-wider">
                  <th className="p-4">Escut</th>
                  <th className="p-4">Nom de l'equip</th>
                  <th className="p-4">País</th>
                  <th className="p-4 text-right">Accions</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((t) => (
                  <tr key={t.id} className="border-b border-white/5 hover:bg-slate-850/20 transition-colors">
                    <td className="p-4">
                      <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center border border-slate-750">
                        {t.shieldUrl ? (
                          <img src={t.shieldUrl} alt="" className="w-5 h-5 object-contain" />
                        ) : (
                          <Shield className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-slate-200">{t.name}</td>
                    <td className="p-4 text-slate-400">{t.country || "N/A"}</td>
                    <td className="p-4 text-right">
                      <div className="inline-flex gap-1.5">
                        <button
                          onClick={() => startEdit(t)}
                          className="p-2 text-slate-400 hover:text-primary hover:bg-slate-800/40 rounded-lg transition-colors border border-transparent hover:border-slate-800"
                          title="Modificar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id, t.name)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-slate-800"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 italic">No hi ha equips registrats.</div>
        )}
      </div>
    </div>
  );
}
