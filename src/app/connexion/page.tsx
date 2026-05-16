"use client";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { toast } from "@/components/ui/Toast";
import ToastContainer from "@/components/ui/Toast";

export default function ConnexionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "";
  const error = searchParams.get("error");
  const [role, setRole] = useState<"candidat" | "rh">("candidat");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);

  useEffect(() => {
    try {
      const saved = document.cookie.match(/remember_email=([^;]+)/);
      if (saved) setEmail(decodeURIComponent(saved[1]));
    } catch {}
    if (error === "COMPTE_BANNI") toast("error", "Votre compte a été suspendu.");
    if (error === "ACCES_REFUSE") toast("error", "Accès refusé à cette section.");
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (remember) {
      document.cookie = `remember_email=${encodeURIComponent(email)}; max-age=2592000; path=/`;
    } else {
      document.cookie = "remember_email=; max-age=0; path=/";
    }
    const redirect = callbackUrl || (document.cookie.match(/login_redirect=([^;]+)/)?.[1] ? decodeURIComponent(document.cookie.match(/login_redirect=([^;]+)/)?.[1] ?? "") : null);
    const res = await signIn("credentials", { email: email.toLowerCase().trim(), password, redirect: false });
    if (res?.error) {
      toast("error", res.error === "COMPTE_BANNI" ? "Compte suspendu" : "Email ou mot de passe incorrect");
      setLoading(false);
      return;
    }
    document.cookie = "login_redirect=; max-age=0; path=/";
    if (redirect && redirect.startsWith("/")) { router.push(redirect); return; }
    // Route by role — need a quick session fetch
    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();
    const r = session?.user?.role;
    router.push(r === "SUPER_ADMIN" ? "/admin" : r === "RH" ? "/dashboard/rh" : "/dashboard/candidat");
    router.refresh();
  };

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen flex">
        {/* Left illustration */}
        <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #5B1A6B 0%, #7B2D8B 50%, #00A99D 100%)" }}>
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%"><defs><pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse"><circle cx="15" cy="15" r="1.5" fill="white"/></pattern></defs><rect width="100%" height="100%" fill="url(#dots)"/></svg>
          </div>
          <div className="relative text-center text-white max-w-sm">
            <div className="w-20 h-20 mx-auto mb-8 rounded-3xl flex items-center justify-center bg-white/20 backdrop-blur-sm">
              <span className="text-4xl font-black" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>OE</span>
            </div>
            <h1 className="text-3xl font-black mb-4 font-display">Bienvenue sur<br />Offres Emploi 242</h1>
            <p className="text-white/70 text-sm leading-relaxed">La plateforme d'emploi sérieuse du Congo-Brazzaville. Des milliers d'opportunités vous attendent.</p>
            <div className="mt-10 grid grid-cols-2 gap-4 text-left">
              {[["1 200+", "Offres actives"], ["300+", "Entreprises"], ["8 500+", "Candidats"], ["950+", "Embauches"]].map(([v, l]) => (
                <div key={l} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-2xl font-black font-display">{v}</p>
                  <p className="text-xs text-white/70 mt-0.5">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right form */}
        <div className="flex-1 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-md">
            <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #7B2D8B, #00A99D)" }}>
                <span className="text-white font-black text-sm">OE</span>
              </div>
              <span className="font-black text-gray-900">Offres Emploi 242</span>
            </Link>

            <h2 className="text-2xl font-black text-gray-900 mb-1 font-display">Bon retour </h2>
            <p className="text-gray-500 text-sm mb-6">Connectez-vous pour accéder à votre espace</p>

            {/* Role tabs */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
              {(["candidat", "rh"] as const).map(r => (
                <button key={r} onClick={() => setRole(r)}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${role === r ? "bg-white text-[#7B2D8B] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                  {r === "candidat" ? "Candidat" : "Entreprise / RH"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Adresse email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="vous@exemple.com" className="input-base" autoComplete="email" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Mot de passe</label>
                <div className="relative">
                  <input type={showPwd ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                    placeholder="••••••••" className="input-base pr-10" autoComplete="current-password" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                    <Icon name={showPwd ? "eyeOff" : "eye"} className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="w-4 h-4 accent-[#7B2D8B] rounded" />
                  <span className="text-sm text-gray-600">Se souvenir de moi</span>
                </label>
                <Link href="/mot-de-passe-oublie" className="text-sm text-[#7B2D8B] font-semibold hover:underline">Mot de passe oublié ?</Link>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3.5">
                {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Connexion...</> : "Se connecter"}
              </button>
            </form>

            <div className="relative my-5"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
              <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">ou</span></div>
            </div>

            <button onClick={() => signIn("google", { callbackUrl: callbackUrl || "/dashboard/candidat" } as any)}
              className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 py-3 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continuer avec Google
            </button>

            <p className="text-center text-sm text-gray-500 mt-6">
              Pas encore inscrit ?{" "}
              <Link href="/inscription" className="text-[#7B2D8B] font-bold hover:underline">Créer un compte</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
