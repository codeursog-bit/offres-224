"use client";
import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/Icon";

const NIVEAU_STYLES: Record<string,{bg:string;text:string}> = {
  INFO:{bg:"bg-blue-50",text:"text-blue-700"},
  WARNING:{bg:"bg-orange-50",text:"text-orange-700"},
  ERROR:{bg:"bg-red-50",text:"text-red-700"},
  SUCCESS:{bg:"bg-green-50",text:"text-green-700"},
};

export default function AdminLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [niveau, setNiveau] = useState("");
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("24h");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async()=>{
    setLoading(true);
    const params = new URLSearchParams({page:page.toString()});
    if(niveau) params.set("niveau",niveau);
    if(search) params.set("action",search);
    const now = new Date();
    const from = new Date(now);
    if(period==="1h") from.setHours(now.getHours()-1);
    else if(period==="24h") from.setDate(now.getDate()-1);
    else if(period==="7j") from.setDate(now.getDate()-7);
    else from.setDate(now.getDate()-30);
    params.set("from",from.toISOString());
    const res = await fetch(`/api/admin/logs?${params}`);
    const d = await res.json();
    setLogs(d.data||[]); setTotal(d.total||0); setLoading(false);
  },[niveau,search,period,page]);

  useEffect(()=>{ load(); },[load]);

  const exportCSV = ()=>{
    const rows = [["Date","Niveau","Action","Utilisateur","IP"],
      ...logs.map(l=>[new Date(l.createdAt).toISOString(),l.niveau,l.action,l.user?.email||l.userId||"—",l.ip||"—"])];
    const csv = rows.map(r=>r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8,"+encodeURIComponent(csv);
    a.download = "logs_system.csv"; a.click();
  };

  const copyJSON = async(log: any)=>{
    await navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    setCopied(true); setTimeout(()=>setCopied(false),2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 font-display">Logs système</h1>
          <p className="text-gray-500 text-sm mt-1">{total.toLocaleString("fr-FR")} entrée{total!==1?"s":""}</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 border border-gray-200 bg-white px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
          <Icon name="download" className="w-4 h-4"/> Exporter CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex bg-gray-100 rounded-xl p-1">
          {["1h","24h","7j","30j"].map(p=>(
            <button key={p} onClick={()=>{setPeriod(p);setPage(1);}}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${period===p?"bg-white text-[#7B2D8B] shadow-sm":"text-gray-500"}`}>
              {p}
            </button>
          ))}
        </div>
        <select value={niveau} onChange={e=>{setNiveau(e.target.value);setPage(1);}} className="input-base text-sm w-auto">
          <option value="">Tous les niveaux</option>
          {["INFO","WARNING","ERROR","SUCCESS"].map(n=><option key={n}>{n}</option>)}
        </select>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 flex-1 min-w-[200px]">
          <Icon name="search" className="w-4 h-4 text-gray-400 shrink-0"/>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Rechercher une action..." className="flex-1 py-2.5 outline-none text-sm bg-transparent"/>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Table */}
        <div className={`bg-white rounded-2xl border border-gray-100 overflow-hidden ${selected?"w-1/2":"w-full"} transition-all duration-300`}>
          {loading?(
            <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-[#7B2D8B] border-t-transparent rounded-full animate-spin"/></div>
          ):(
            <>
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>{["Heure","Niveau","Action","Utilisateur","IP"].map(h=>(
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {logs.map(log=>{
                    const s = NIVEAU_STYLES[log.niveau]||NIVEAU_STYLES.INFO;
                    return (
                      <tr key={log.id} className={`table-row cursor-pointer ${selected?.id===log.id?"bg-[#F3E8F6]":""}`}
                        onClick={()=>setSelected(log)}>
                        <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>{log.niveau}</span>
                        </td>
                        <td className="px-4 py-3 text-sm font-mono text-gray-900 max-w-[200px] truncate">{log.action}</td>
                        <td className="px-4 py-3 text-xs text-gray-500 truncate max-w-[120px]">
                          {log.user?.email||log.userId||"—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">{log.ip||"—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {/* Pagination */}
              {total>50&&(
                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400">Page {page}</p>
                  <div className="flex gap-2">
                    <button disabled={page===1} onClick={()=>setPage(p=>p-1)} className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
                      <Icon name="chevronLeft" className="w-4 h-4 text-gray-600"/>
                    </button>
                    <button disabled={page*50>=total} onClick={()=>setPage(p=>p+1)} className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
                      <Icon name="chevronRight" className="w-4 h-4 text-gray-600"/>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Detail panel */}
        {selected&&(
          <div className="w-1/2 bg-white rounded-2xl border border-gray-100 flex flex-col animate-fade-in">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 font-display text-sm">Détail du log</h3>
              <div className="flex items-center gap-2">
                <button onClick={()=>copyJSON(selected)} className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 px-2.5 py-1.5 rounded-lg transition-colors">
                  <Icon name={copied?"checkCircle":"copy"} className="w-3.5 h-3.5"/>
                  {copied?"Copié !":"Copier JSON"}
                </button>
                <button onClick={()=>setSelected(null)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                  <Icon name="x" className="w-4 h-4 text-gray-400"/>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3 text-sm mb-4">
                {[
                  ["Action",<span className="font-mono font-bold">{selected.action}</span>],
                  ["Niveau",<span className={`font-bold px-2 py-0.5 rounded-full text-xs ${NIVEAU_STYLES[selected.niveau]?.bg} ${NIVEAU_STYLES[selected.niveau]?.text}`}>{selected.niveau}</span>],
                  ["Date",new Date(selected.createdAt).toLocaleString("fr-FR")],
                  ["Utilisateur",selected.user?.email||selected.userId||"—"],
                  ["Cible",selected.cible||"—"],
                  ["IP",selected.ip||"—"],
                  ["User-Agent",selected.userAgent||"—"],
                ].map(([k,v])=>(
                  <div key={String(k)} className="flex gap-3">
                    <span className="text-gray-500 text-xs w-24 shrink-0 pt-0.5">{k}</span>
                    <div className="text-gray-900 text-xs break-all">{v as any}</div>
                  </div>
                ))}
              </div>
              {selected.details&&(
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-2">Details (JSON)</p>
                  <pre className="bg-[#1E1E2E] text-[#E2E8F0] p-4 rounded-xl text-xs overflow-x-auto leading-relaxed">
                    {JSON.stringify(selected.details,null,2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
