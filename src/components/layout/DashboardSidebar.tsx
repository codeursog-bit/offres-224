"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Icon, { IconName } from "@/components/ui/Icon";
import Avatar from "@/components/ui/Avatar";

interface NavItem { href: string; label: string; icon: IconName; badge?: number; }

interface Props {
  navItems: NavItem[];
  role: "candidat" | "rh" | "admin";
}

export default function DashboardSidebar({ navItems, role }: Props) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const name = (session?.user as any)?.prenom
    || (session?.user as any)?.nom
    || session?.user?.email?.split("@")[0]
    || "Utilisateur";

  const roleLabel = role === "admin" ? "Super Admin" : role === "rh" ? "Recruteur" : "Candidat";
  const roleColor = role === "admin" ? "#C0392B" : role === "rh" ? "#00A99D" : "#7B2D8B";

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Avatar name={name} size={40} />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{name}</p>
              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold text-white mt-0.5" style={{ background: roleColor }}>
                {roleLabel}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? "bg-[#F3E8F6] text-[#7B2D8B] font-bold" : "nav-item"}`}
              style={active ? { borderLeft: "3px solid #7B2D8B", paddingLeft: "calc(0.75rem - 3px)" } : {}}>
              <Icon name={item.icon} className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && item.badge && item.badge > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-100 space-y-1">
        <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm nav-item">
          <Icon name="externalLink" className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Voir le site</span>}
        </Link>
        <button onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors font-medium">
          <Icon name="logout" className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-white border-r border-gray-100 transition-all duration-300 z-30 ${collapsed ? "w-16" : "w-60"}`}>
        {/* Toggle collapse */}
        <button onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow z-10">
          <Icon name={collapsed ? "chevronRight" : "chevronLeft"} className="w-3 h-3 text-gray-500" />
        </button>
        {sidebarContent}
      </aside>

      {/* Mobile hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-100 flex items-center px-4 z-40 shadow-sm">
        <button onClick={() => setMobileOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg mr-3">
          <Icon name="menu" className="w-5 h-5 text-gray-700" />
        </button>
        <span className="font-black text-gray-900 text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Offres Emploi <span className="text-[#7B2D8B]">242</span>
        </span>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 lg:hidden animate-fade-in" onClick={() => setMobileOpen(false)} />
          <aside className="fixed left-0 top-0 h-full w-64 bg-white z-50 lg:hidden shadow-2xl animate-slide-right">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
