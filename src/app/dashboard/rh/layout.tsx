import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardSidebar from "@/components/layout/DashboardSidebar";

const NAV = [
  { href: "/dashboard/rh", label: "Tableau de bord", icon: "grid" as const },
  { href: "/dashboard/rh/offres", label: "Nos offres", icon: "briefcase" as const },
  { href: "/dashboard/rh/candidats", label: "CVthèque", icon: "users" as const },
  { href: "/dashboard/rh/parametres", label: "Profil entreprise", icon: "settings" as const },
];

export default async function RHLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/connexion");
  if ((session.user as any).role === "CANDIDAT") redirect("/dashboard/candidat");
  return (
    <div className="min-h-screen bg-[#F8F7FA]">
      <DashboardSidebar navItems={NAV} role="rh" />
      <div className="lg:pl-60 pt-14 lg:pt-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">{children}</div>
      </div>
    </div>
  );
}
