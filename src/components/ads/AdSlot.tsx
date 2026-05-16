"use client";
import { useEffect, useState } from "react";

interface AdData {
  id: string; imageUrl: string; linkUrl: string; titre?: string;
  description?: string; ctaText?: string; annonceur?: string;
  couleurFond?: string; placement: string;
}

interface Props { placement: string; city?: string; secteur?: string; className?: string; }

export default function AdSlot({ placement, city, secteur, className = "" }: Props) {
  const [ad, setAd] = useState<AdData | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (placement === "INTERSTITIEL") {
      const key = `ad_dismissed_interstitiel`;
      if (document.cookie.includes(key)) { setDismissed(true); return; }
    }
    const params = new URLSearchParams({ placement });
    if (city) params.set("city", city);
    if (secteur) params.set("secteur", secteur);
    fetch(`/api/ads/serve?${params}`)
      .then(r => r.json())
      .then(d => { if (d?.id) setAd(d); })
      .catch(() => {});
  }, [placement, city, secteur]);

  useEffect(() => {
    if (!ad) return;
    fetch("/api/ads/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ adId: ad.id, event: "IMPRESSION" }) }).catch(() => {});
  }, [ad]);

  const handleClick = () => {
    if (!ad) return;
    fetch("/api/ads/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ adId: ad.id, event: "CLICK" }) }).catch(() => {});
  };

  const handleDismiss = () => {
    if (!ad) return;
    fetch("/api/ads/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ adId: ad.id, event: "DISMISS" }) }).catch(() => {});
    document.cookie = `ad_dismissed_interstitiel=1; max-age=86400; path=/`;
    setDismissed(true);
  };

  if (!ad || dismissed) return null;

  if (placement === "INTERSTITIEL") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleDismiss} />
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
          <button onClick={handleDismiss} className="absolute top-3 right-3 z-10 p-1.5 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" onClick={handleClick}>
            {ad.imageUrl && <img src={ad.imageUrl} alt={ad.titre || ""} className="w-full h-48 object-cover" />}
            <div className="p-5">
              {ad.titre && <h3 className="font-bold text-gray-900 text-lg">{ad.titre}</h3>}
              {ad.description && <p className="text-sm text-gray-600 mt-1">{ad.description}</p>}
              {ad.ctaText && <div className="mt-4 w-full bg-[#E67E22] text-white font-bold py-2.5 rounded-xl text-center text-sm">{ad.ctaText}</div>}
            </div>
          </a>
          <div className="px-5 pb-3 text-[10px] text-gray-400 text-center">Publicité • {ad.annonceur}</div>
        </div>
      </div>
    );
  }

  if (placement === "HERO_BANNER" || placement === "FOOTER_BANNER") {
    return (
      <div className={`relative w-full bg-gray-50 border border-gray-100 rounded-xl overflow-hidden ${className}`}>
        <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" onClick={handleClick} className="block">
          {ad.imageUrl ? <img src={ad.imageUrl} alt={ad.titre || ""} className="w-full h-20 object-cover" />
            : <div className="h-20 flex items-center justify-center px-6 gap-4" style={{ background: ad.couleurFond }}>
                {ad.titre && <span className="font-bold text-gray-900">{ad.titre}</span>}
                {ad.ctaText && <span className="px-4 py-1.5 bg-[#E67E22] text-white rounded-lg text-sm font-bold">{ad.ctaText}</span>}
              </div>}
        </a>
        <span className="absolute top-1 right-2 text-[10px] text-gray-400">Publicité</span>
      </div>
    );
  }

  if (placement === "FEED_CARD") {
    return (
      <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" onClick={handleClick}
        className="block bg-white rounded-2xl border-2 border-[#E67E22]/30 p-5 hover:border-[#E67E22] transition-colors relative">
        <span className="absolute top-3 right-3 text-[10px] text-[#E67E22] font-semibold bg-[#FEF0E6] px-2 py-0.5 rounded-full">Sponsorisé</span>
        <div className="flex gap-3 items-start">
          {ad.imageUrl && <img src={ad.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />}
          <div>
            {ad.titre && <h3 className="font-bold text-gray-900 text-sm">{ad.titre}</h3>}
            {ad.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{ad.description}</p>}
          </div>
        </div>
        {ad.ctaText && <div className="mt-3 text-center bg-[#E67E22] text-white text-xs font-bold py-2 rounded-xl">{ad.ctaText}</div>}
      </a>
    );
  }

  if (placement === "SIDEBAR_SQUARE") {
    return (
      <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" onClick={handleClick}
        className="block bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow relative">
        <span className="absolute top-2 right-2 text-[10px] text-gray-400 z-10">Pub</span>
        {ad.imageUrl && <img src={ad.imageUrl} alt="" className="w-full h-40 object-cover" />}
        <div className="p-3">
          {ad.titre && <p className="text-sm font-bold text-gray-900">{ad.titre}</p>}
          {ad.ctaText && <div className="mt-2 text-center border-2 border-[#E67E22] text-[#E67E22] text-xs font-bold py-1.5 rounded-lg">{ad.ctaText}</div>}
        </div>
      </a>
    );
  }

  // CONSEILS_INLINE
  return (
    <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" onClick={handleClick}
      className={`flex gap-4 items-center bg-[#FEF0E6] rounded-2xl p-4 hover:shadow-md transition-shadow relative ${className}`}>
      <span className="absolute top-2 right-3 text-[10px] text-[#E67E22]">Publicité</span>
      {ad.imageUrl && <img src={ad.imageUrl} alt="" className="w-20 h-20 rounded-xl object-cover shrink-0" />}
      <div>
        {ad.titre && <p className="font-bold text-gray-900 text-sm">{ad.titre}</p>}
        {ad.description && <p className="text-xs text-gray-600 mt-1 line-clamp-2">{ad.description}</p>}
        {ad.ctaText && <span className="inline-block mt-2 text-xs font-bold text-[#E67E22]">{ad.ctaText} →</span>}
      </div>
    </a>
  );
}
