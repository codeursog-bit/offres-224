// components/auth/PasswordStrength.tsx
export default function PasswordStrength({ pass }: { pass: string }) {
  const strength = pass.length === 0 ? 0 : 
    [/ [A-Z] /, / [0-9] /, / [!@#$%^&*] /].filter(re => re.test(pass)).length + (pass.length > 8 ? 1 : 0);
  
  const colors = ["bg-gray-200", "bg-red-500", "bg-orange-500", "bg-teal-500"];
  const labels = ["Vide", "Faible", "Moyen", "Fort"];

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1 h-1">
        {[1, 2, 3].map(i => (
          <div key={i} className={`flex-1 rounded-full transition-all ${strength >= i ? colors[strength] : 'bg-gray-100'}`} />
        ))}
      </div>
      <p className="text-[10px] font-black uppercase text-gray-400">{labels[strength]}</p>
    </div>
  );
}