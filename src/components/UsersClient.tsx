"use client";

import { useState } from "react";
import { updateUserRole } from "@/app/actions/users";
import { Users, Shield, User as UserIcon, ShieldAlert } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function UsersClient({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = useState(initialUsers);
  const { data: session } = useSession();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRoleChange = async (userId: string, newRole: string) => {
    setError(null);
    setUpdatingId(userId);

    try {
      const res = await updateUserRole(userId, newRole);

      if (res.success) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        router.refresh();
      } else {
        setError(res.error || "No s'ha pogut canviar el rol de l'usuari.");
      }
    } catch (err) {
      setError("Error de xarxa en actualitzar el rol.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" />
          <span>Gestió de Rols d'Usuaris</span>
        </h1>
        <p className="text-xs text-slate-400 font-light mt-0.5">
          Assigneu rols d'ADMIN, EDITOR o USER als comptes registrats.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg p-3">
          {error}
        </div>
      )}

      {/* Users List Table */}
      <div className="glass rounded-xl overflow-hidden border border-white/5">
        {users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-slate-900/50 text-slate-400 uppercase font-semibold tracking-wider">
                  <th className="p-4">Usuari</th>
                  <th className="p-4">Correu Electrònic</th>
                  <th className="p-4">Data Registre</th>
                  <th className="p-4">Rol actual</th>
                  <th className="p-4 text-right">Canviar Rol</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf = session?.user?.id === u.id;
                  const isUpdating = updatingId === u.id;

                  return (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-slate-850/20 transition-colors">
                      <td className="p-4 font-bold text-slate-200">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center text-[10px] text-slate-400">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <span>{u.name}</span>
                          {isSelf && (
                            <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.2 rounded">
                              Tu
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-slate-400">{u.email}</td>
                      <td className="p-4 text-slate-500">
                        {new Date(u.createdAt).toLocaleDateString("ca-ES", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] tracking-wider uppercase ${
                          u.role === "ADMIN"
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : u.role === "EDITOR"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <select
                          value={u.role}
                          disabled={isSelf || isUpdating}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-300 focus:outline-none focus:border-primary p-1.5 transition-all disabled:opacity-40"
                        >
                          <option value="USER">USER (Lector)</option>
                          <option value="EDITOR">EDITOR (Contingut)</option>
                          <option value="ADMIN">ADMIN (Superusuari)</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 italic">No s'han trobat usuaris registrats.</div>
        )}
      </div>
    </div>
  );
}
