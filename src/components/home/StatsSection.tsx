"use client";
import { useEffect, useRef, useState } from "react";
const STATS = [
  { label: "Offres actives", value: 1200, suffix: "+" },
  { label: "Entreprises", value: 300, suffix: "+" },
  { label: "Candidats inscrits", value: 8500, suffix: "+" },
  { label: "Embauches réalisées", value: 950, suffix: "+" },
];
function useCountUp(target: number, active: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0; const duration = 1500; const startTime = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, active]);
  return count;
}
function Stat({ label, value, suffix }: { label: string; value: number; suffix: string }) {
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const count = useCountUp(value, active);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setActive(true); }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl font-black font-display" style={{ color: "#7B2D8B" }}>
        {count.toLocaleString("fr-FR")}{suffix}
      </div>
      <div className="text-sm text-gray-500 mt-1 font-medium">{label}</div>
    </div>
  );
}
export default function StatsSection() {
  return (
    <section className="bg-white border-b border-gray-100 py-10">
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        {STATS.map(s => <Stat key={s.label} {...s} />)}
      </div>
    </section>
  );
}
