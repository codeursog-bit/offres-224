"use client";
import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import Modal from "@/components/ui/Modal";
import { toast } from "@/components/ui/Toast";
import ToastContainer from "@/components/ui/Toast";

export default function AdminUtilisateurs() {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("Tous");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [banModal, setBanModal] = useState<any>(null);
  const [banMotif, setBanMotif] = useState("");
  const [banDuree, setBanDuree] = useState("30");
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
  const [deleteText, setDeleteText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString() });
    if (search) params.set("search", search);
    if (tab === "Candidats") params.set("role", "CANDIDAT");
    if (tab === "RH") params.set("role", "RH");
    if (tab === "Bannis") params.set("isBanned", "true");
    const res = await fetch(`/api/admin/users?${params}`);
    const d = await res.json();
    setUsers(d.data || []); setTotal(d.total || 0); setLoading(false);
  }, [tab, search, page]);

  useEffect(() => { load(); }, [load]);

  const doAction = async (userId: string, action: string, extra: any = {}) => {
    setSubmitting(true);
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...extra })
    });
    if (res.ok) { toast("success", "Action effectuée"); load(); }
    else toast("error", "Erreur");
    setSubmitting(false);
  };

  const doDelete = async (userId: string) => {
    if (deleteText !== "SUPPRIMER") { toast("error", "Tapez exactement SUPPRIMER"); return; }
    setSubmitting(true);
    const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    if (res.ok) { toast("success", "Compte supprimé"); setDeleteConfirm(null); setDeleteText(""); load(); }
    else toast("error", "Erreur");
    setSubmitting(false);
  };

  const handleBan = async () => {
    if (!banMotif || banMotif.length < 10) { toast("error", "Motif trop court (min 10 car.)"); return; }
    await doAction(banModal.id, "ban", { motif: banMotif, banDureeJours: parseInt(banDuree) });
    setBanModal(null); setBanMotif(""); setBanDuree("30");
  };

  const statusBadge = (u: any) => {
    if (u.isBanned) return <Badge variant="red">Banni</Badge>;
    if (!u.isActive) return <Badge variant="gray">Inactif</Badge>;
    return <Badge variant="teal">Actif</Badge>;
  };

  const roleBadge = (role: string) => {
    const map: Record<string, string> = { CANDIDAT: "violet", RH: "teal", SUPER_ADMIN: "red" };
    return <Badge variant={map[role] as any}>{role}</Badge>;
  };

  return (
    <>
      <ToastContainer />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 font-display">Utilisateurs</h1>
            <p className="text-gray-500 text-sm mt-1">{total} utilisateur{total !== 1 ? "s" : ""} au total</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {["Tous", "Candidats", "RH", "Bannis"].map(t => (
            <button key={t} onClick={() => { setTab(t); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap ${tab === t ? "bg-[#7B2D8B] text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 max-w-md">
          <Icon name="search" className="w-4 h-4 text-gray-400 shrink-0" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Rechercher par email, nom..." className="flex-1 py-3 outline-none text-sm bg-transparent text-gray-900" />
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-[#7B2D8B] border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{["Utilisateur", "Rôle", "Ville", "Inscrit le", "Dernière connexion", "Statut", "Actions"].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(u => {
                  const nom = u.profilCandidat ? `${u.profilCandidat.prenom} ${u.profilCandidat.nom}` : u.profilEntreprise?.nomEntreprise || u.email.split("@")[0];
                  const ville = u.profilCandidat?.ville || u.profilEntreprise?.ville || "—";
                  return (
                    <tr key={u.id} className="table-row">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={nom} size={32} />
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{nom}</p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">{roleBadge(u.role)}</td>
                      <td className="px-5 py-4 text-sm text-gray-500">{ville}</td>
                      <td className="px-5 py-4 text-sm text-gray-400">
                        {new Date(u.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "2-digit" })}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-400">
                        {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : "Jamais"}
                      </td>
                      <td className="px-5 py-4">{statusBadge(u)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          {u.isBanned ? (
                            <button onClick={() => doAction(u.id, "unban")} title="Débannir"
                              className="p-1.5 hover:bg-green-50 rounded-lg transition-colors">
                              <Icon name="checkCircle" className="w-4 h-4 text-green-500" />
                            </button>
                          ) : (
                            <button onClick={() => setBanModal(u)} title="Bannir"
                              className="p-1.5 hover:bg-orange-50 rounded-lg transition-colors">
                              <Icon name="shield" className="w-4 h-4 text-orange-400" />
                            </button>
                          )}
                          {u.role !== "SUPER_ADMIN" && (
                            <button onClick={() => doAction(u.id, "promoteAdmin")} title="Promouvoir admin"
                              className="p-1.5 hover:bg-[#F3E8F6] rounded-lg transition-colors">
                              <Icon name="star" className="w-4 h-4 text-[#7B2D8B]" />
                            </button>
                          )}
                          {u.profilEntreprise && !u.profilEntreprise.isVerifiee && (
                            <button onClick={() => fetch(`/api/admin/entreprises/${u.profilEntreprise.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "verify" }) }).then(() => { toast("success", "Entreprise vérifiée"); load(); })}
                              title="Vérifier l'entreprise" className="p-1.5 hover:bg-[#E0F5F4] rounded-lg transition-colors">
                              <Icon name="checkCircle" className="w-4 h-4 text-[#00A99D]" />
                            </button>
                          )}
                          <button onClick={() => { setDeleteConfirm(u); setDeleteText(""); }} title="Supprimer"
                            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                            <Icon name="trash" className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ban Modal */}
      <Modal open={!!banModal} onClose={() => setBanModal(null)} title="Bannir l'utilisateur" size="sm">
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">Bannir <strong>{banModal?.email}</strong></p>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Motif * (min 10 caractères)</label>
            <textarea value={banMotif} onChange={e => setBanMotif(e.target.value)} rows={3} className="input-base resize-none" placeholder="Expliquez la raison du bannissement..." />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Durée</label>
            <select value={banDuree} onChange={e => setBanDuree(e.target.value)} className="input-base">
              <option value="7">7 jours</option>
              <option value="30">30 jours</option>
              <option value="0">Permanent</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setBanModal(null)} className="btn-outline flex-1 py-2.5 text-sm">Annuler</button>
            <button onClick={handleBan} disabled={submitting} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50">Bannir</button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Supprimer définitivement" size="sm">
        <div className="p-6 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-sm text-red-700 font-semibold"><Icon name="warning" className="w-4 h-4 text-orange-400" /> Action irréversible</p>
            <p className="text-xs text-red-600 mt-1">Toutes les données de cet utilisateur seront supprimées.</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Tapez <strong>SUPPRIMER</strong> pour confirmer</label>
            <input value={deleteText} onChange={e => setDeleteText(e.target.value)} placeholder="SUPPRIMER" className="input-base" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setDeleteConfirm(null)} className="btn-outline flex-1 py-2.5 text-sm">Annuler</button>
            <button onClick={() => doDelete(deleteConfirm.id)} disabled={deleteText !== "SUPPRIMER" || submitting}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-40">
              Supprimer définitivement
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
