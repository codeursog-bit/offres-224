// Génère un avatar coloré depuis le nom
"use client";
export function avatarColor(name: string): string {
  const colors = ["#7B2D8B","#00A99D","#E67E22","#2980B9","#27AE60","#C0392B","#8E44AD","#16A085"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}
interface Props { name: string; src?: string | null; size?: number; className?: string; }
export default function Avatar({ name, src, size = 40, className = "" }: Props) {
  const initials = name.split(" ").slice(0, 2).map(w => w[0]?.toUpperCase() ?? "").join("");
  const bg = avatarColor(name);
  if (src) return <img src={src} alt={name} width={size} height={size} style={{ borderRadius: "50%", objectFit: "cover", width: size, height: size }} className={className} />;
  return (
    <div className={className} style={{ width: size, height: size, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: size * 0.36, flexShrink: 0 }}>
      {initials || "?"}
    </div>
  );
}
