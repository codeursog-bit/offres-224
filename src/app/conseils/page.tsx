"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AdSlot from "@/components/ads/AdSlot";
import Icon from "@/components/ui/Icon";

const CATS = [
  {v:"",l:"Tous"},
  {v:"cv",l:"CV & Profil"},
  {v:"entretien",l:"Entretien"},
  {v:"reconversion",l:"Reconversion"},
  {v:"droits",l:"Droits du travail"},
  {v:"secteurs",l:"Secteurs porteurs"},
];
const CAT_COLORS: Record<string,string> = {
  cv:"#7B2D8B", entretien:"#00A99D", reconversion:"#E67E22",
  droits:"#2980B9", secteurs:"#27AE60",
};

function ArticleCard({a,featured=false}:{a:any;featured?:boolean}) {
  const color = CAT_COLORS[a.categorie]||"#7B2D8B";
  const date = new Date(a.publieAt||a.createdAt).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"});
  if(featured) return (
    <Link href={`/conseils/${a.slug}`} className="block col-span-full">
      <div className="relative rounded-2xl overflow-hidden card-hover" style={{background:`linear-gradient(135deg,${color}dd,${color}88)`}}>
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%"><defs><pattern id="dotsf" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="white"/></pattern></defs><rect width="100%" height="100%" fill="url(#dotsf)"/></svg>
        </div>
        <div className="relative p-8 md:p-12 max-w-2xl">
          <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-white/20 text-white mb-4">{a.categorie?.toUpperCase()}</span>
          <h2 className="text-2xl md:text-3xl font-black text-white font-display leading-tight mb-3">{a.titre}</h2>
          {a.extrait&&<p className="text-white/80 text-sm leading-relaxed mb-5">{a.extrait}</p>}
          <div className="flex items-center gap-4 text-white/70 text-xs">
            <span>{a.auteur}</span>
            <span>·</span>
            <span>{date}</span>
            {a.tpsLecture&&<span className="flex items-center gap-1"><Icon name="clock" className="w-3.5 h-3.5"/>{a.tpsLecture}min</span>}
            <span className="flex items-center gap-1"><Icon name="eye" className="w-3.5 h-3.5"/>{a.vues} vues</span>
          </div>
          <div className="mt-6 inline-flex items-center gap-2 bg-white text-sm font-bold px-5 py-2.5 rounded-xl" style={{color}}>
            Lire l'article <Icon name="arrowRight" className="w-4 h-4"/>
          </div>
        </div>
      </div>
    </Link>
  );
  return (
    <Link href={`/conseils/${a.slug}`} className="block">
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden card-hover h-full flex flex-col">
        <div className="h-32 flex items-center justify-center text-4xl" style={{background:`linear-gradient(135deg,${color}22,${color}11)`}}>
          {a.categorie==="cv"?"📄":a.categorie==="entretien"?"🎤":a.categorie==="reconversion"?"🔄":a.categorie==="droits"?"⚖️":"🏭"}
        </div>
        <div className="p-5 flex-1 flex flex-col">
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full self-start mb-2" style={{background:`${color}15`,color}}>
            {CATS.find(c=>c.v===a.categorie)?.l||a.categorie}
          </span>
          <h3 className="font-bold text-gray-900 font-display line-clamp-2 flex-1 mb-3">{a.titre}</h3>
          {a.extrait&&<p className="text-xs text-gray-500 line-clamp-2 mb-3">{a.extrait}</p>}
          <div className="flex items-center justify-between text-xs text-gray-400 mt-auto pt-3 border-t border-gray-50">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{background:color}}>
                {a.auteur[0]}
              </div>
              <span>{a.auteur}</span>
            </div>
            <div className="flex items-center gap-3">
              {a.tpsLecture&&<span className="flex items-center gap-1"><Icon name="clock" className="w-3 h-3"/>{a.tpsLecture}min</span>}
              <span className="flex items-center gap-1"><Icon name="eye" className="w-3 h-3"/>{a.vues}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ConseilsPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(async(reset=false)=>{
    if(reset) setPage(1);
    setLoading(true);
    const p = new URLSearchParams({page:reset?"1":page.toString()});
    if(cat) p.set("categorie",cat);
    const [resA, resF] = await Promise.all([
      fetch(`/api/articles?${p}`),
      page===1?fetch("/api/articles?featured=true&limit=1"):Promise.resolve(null),
    ]);
    const dA = await resA.json();
    setArticles(prev => reset||page===1 ? (dA.data||[]) : [...prev,...(dA.data||[])]);
    setTotal(dA.total||0);
    if(resF){ const dF = await resF.json(); setFeatured(dF.data?.[0]||null); }
    setLoading(false);
  },[cat,page]);

  useEffect(()=>{ load(true); },[cat]);
  useEffect(()=>{ if(page>1) load(); },[page]);

  return (
    <>
      <Navbar/>
      <main className="pt-16 min-h-screen bg-[#F8F7FA]">
        <div className="bg-white border-b border-gray-100 px-6 py-10">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-black text-gray-900 font-display">Conseils emploi</h1>
            <p className="text-gray-500 mt-1 text-sm">Guides, astuces et stratégies pour réussir votre carrière au Congo</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
            {CATS.map(c=>(
              <button key={c.v} onClick={()=>setCat(c.v)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${cat===c.v?"text-white shadow-md":"bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                style={cat===c.v?{background:c.v?CAT_COLORS[c.v]:"#7B2D8B"}:{}}>
                {c.l}
              </button>
            ))}
          </div>

          {/* Featured */}
          {featured&&page===1&&!cat&&(
            <div className="mb-8">
              <ArticleCard a={featured} featured/>
            </div>
          )}

          <AdSlot placement="CONSEILS_INLINE" className="mb-8"/>

          {loading&&articles.length===0?(
            <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-[#7B2D8B] border-t-transparent rounded-full animate-spin"/></div>
          ):articles.length===0?(
            <div className="text-center py-20">
              <div className="text-5xl mb-4"><Icon name="pencil" className="w-8 h-8 text-gray-400" /></div>
              <h3 className="font-bold text-gray-900 font-display mb-2">Aucun article dans cette catégorie</h3>
              <button onClick={()=>setCat("")} className="btn-outline text-sm px-6 py-2.5 mt-3">Voir tous les articles</button>
            </div>
          ):(
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
                {articles.map((a:any,i:number)=>(
                  <div key={a.id}>
                    {i===2&&<AdSlot placement="CONSEILS_INLINE" className="mb-6 col-span-full hidden lg:block"/>}
                    <ArticleCard a={a}/>
                  </div>
                ))}
              </div>
              {articles.length<total&&(
                <div className="text-center mt-10">
                  <button onClick={()=>setPage(p=>p+1)} disabled={loading}
                    className="btn-outline px-8 py-3 text-sm flex items-center gap-2 mx-auto disabled:opacity-50">
                    {loading?<><div className="w-4 h-4 border-2 border-[#7B2D8B] border-t-transparent rounded-full animate-spin"/>Chargement...</>:"Charger plus d'articles"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer/>
    </>
  );
}
