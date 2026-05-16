// lib/utils.ts
export const formatSalaire = (min?: number, max?: number) => {
  if (!min) return "À discuter";
  if (!max) return `${min.toLocaleString()} CFA`;
  return `${min.toLocaleString()} – ${max.toLocaleString()} CFA`;
};

export const genererAvatarColor = (nom: string) => {
  const colors = ["#7B2D8B", "#00A99D", "#E67E22", "#2980B9", "#27AE60"];
  let hash = 0;
  for (let i = 0; i < nom.length; i++) hash = nom.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};