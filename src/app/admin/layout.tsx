import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardSidebar from "@/components/layout/DashboardSidebar";

const NAV = [
  { href: "/admin", label: "Tableau de bord", icon: "grid" as const },
  { href: "/admin/validation", label: "Validation offres", icon: "checkCircle" as const },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: "users" as const },
  { href: "/admin/offres", label: "Toutes les offres", icon: "briefcase" as const },
  { href: "/admin/publicites", label: "Publicités", icon: "star" as const },
  { href: "/admin/logs", label: "Logs système", icon: "document" as const },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || (session.user as any).role !== "SUPER_ADMIN") redirect("/connexion?error=ACCES_REFUSE");
  return (
    <div className="min-h-screen bg-[#F8F7FA]">
      <DashboardSidebar navItems={NAV} role="admin" />
      <div className="lg:pl-60 pt-14 lg:pt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">{children}</div>
      </div>
    </div>
  );
}
