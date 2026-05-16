"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Icon from "@/components/ui/Icon";
import Avatar from "@/components/ui/Avatar";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!session) return;
    fetch("/api/notifications?page=1")
      .then(r => r.json())
      .then(d => setNotifCount(d.nbNonLues ?? 0))
      .catch(() => {});
  }, [session]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navLinks = [
    { href: "/offres", label: "Offres d'emploi" },
    { href: "/entreprises", label: "Entreprises" },
    { href: "/formations", label: "Formations" },
    { href: "/conseils", label: "Conseils" },
  ];

  const dashboardHref = session?.user
    ? (session.user as any).role === "SUPER_ADMIN" ? "/admin"
    : (session.user as any).role === "RH" ? "/dashboard/rh"
    : "/dashboard/candidat"
    : "/connexion";

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #7B2D8B, #00A99D)" }}>
            <span className="text-white font-black text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>OE</span>
          </div>
          <span className="font-black text-gray-900 hidden sm:block" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.95rem" }}>
            Offres Emploi <span className="text-[#7B2D8B]">242</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${pathname.startsWith(l.href) ? "bg-[#F3E8F6] text-[#7B2D8B]" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`}>
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {session ? (
            <>
              {/* Notif bell */}
              <Link href={dashboardHref} className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Icon name="bell" className="w-5 h-5 text-gray-600" />
                {notifCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                )}
              </Link>
              {/* User menu */}
              <div className="relative" ref={userMenuRef}>
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-xl transition-colors">
                  <Avatar name={(session.user as any)?.prenom || session.user?.email || "U"} src={null} size={32} />
                  <Icon name="chevronDown" className="w-4 h-4 text-gray-500 hidden sm:block" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-scale-in">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{(session.user as any)?.prenom || "Utilisateur"}</p>
                      <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                    </div>
                    <Link href={dashboardHref} onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <Icon name="grid" className="w-4 h-4 text-gray-400" />
                      Mon tableau de bord
                    </Link>
                    <button onClick={() => { setUserMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <Icon name="logout" className="w-4 h-4" />
                      Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/connexion" className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-semibold text-[#7B2D8B] hover:bg-[#F3E8F6] rounded-lg transition-colors">
                Connexion
              </Link>
              <Link href="/inscription" className="btn-primary text-sm px-4 py-2">
                S'inscrire
              </Link>
            </>
          )}
          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors ml-1">
            <Icon name={mobileOpen ? "x" : "menu"} className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1 animate-fade-in shadow-lg">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
              className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${pathname.startsWith(l.href) ? "bg-[#F3E8F6] text-[#7B2D8B]" : "text-gray-700 hover:bg-gray-50"}`}>
              {l.label}
            </Link>
          ))}
          {!session && (
            <div className="flex gap-2 pt-2">
              <Link href="/connexion" onClick={() => setMobileOpen(false)} className="flex-1 text-center px-4 py-3 border-2 border-[#7B2D8B] text-[#7B2D8B] rounded-xl text-sm font-bold">Connexion</Link>
              <Link href="/inscription" onClick={() => setMobileOpen(false)} className="flex-1 text-center btn-primary text-sm py-3">S'inscrire</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
