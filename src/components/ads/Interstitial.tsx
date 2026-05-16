"use client";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";

export default function AdInterstitial({ ad }: { ad: any }) {
  const [timer, setTimer] = useState(5);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hasSeen = Cookies.get(`ad_seen_${ad.id}`);
    if (!hasSeen) {
      setVisible(true);
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [ad.id]);

  const closeAd = () => {
    setVisible(false);
    Cookies.set(`ad_seen_${ad.id}`, "1", { expires: 1 }); // 24h
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
        <div className="h-64 bg-gradient-to-br from-[#7B2D8B] to-[#00A99D] flex items-center justify-center p-12">
          <p className="text-white font-black text-4xl text-center uppercase tracking-tighter">Offre Sponsorisée</p>
        </div>
        <div className="p-10 text-center">
          <h2 className="text-2xl font-black text-gray-900 mb-4">{ad.titre}</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">{ad.description}</p>
          <a href={ad.linkUrl} className="block w-full py-4 bg-orange-500 text-white font-black rounded-2xl hover:bg-orange-600 transition-colors">
            En savoir plus
          </a>
          <button 
            disabled={timer > 0}
            onClick={closeAd}
            className={`mt-6 text-xs font-bold uppercase tracking-widest ${timer > 0 ? 'text-gray-300' : 'text-[#7B2D8B] hover:underline'}`}
          >
            {timer > 0 ? `Fermeture dans ${timer}s...` : "Fermer la publicité"}
          </button>
        </div>
      </div>
    </div>
  );
}