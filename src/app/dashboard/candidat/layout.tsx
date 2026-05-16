import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardSidebar from "@/components/layout/DashboardSidebar";

const NAV = [
  { href: "/dashboard/candidat", label: "Tableau de bord", icon: "grid" as const },
  { href: "/dashboard/candidat/profil", label: "Mon profil", icon: "user" as const },
  { href: "/dashboard/candidat/candidatures", label: "Mes candidatures", icon: "document" as const },
  { href: "/dashboard/candidat/alertes", label: "Alertes emploi", icon: "bell" as const },
];

export default async function CandidatLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/connexion");
  if ((session.user as any).role === "RH") redirect("/dashboard/rh");
  if ((session.user as any).role === "SUPER_ADMIN") redirect("/admin");

  return (
    <div className="min-h-screen bg-[#F8F7FA]">
      <DashboardSidebar navItems={NAV} role="candidat" />
      <div className="lg:pl-60 pt-14 lg:pt-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">{children}</div>
      </div>
    </div>
  );
}
