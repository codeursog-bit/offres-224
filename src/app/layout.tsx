import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import ToastContainer from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: { default: "Offres Emploi Sérieuse 242 — Congo Brazzaville", template: "%s | Offres Emploi 242" },
  description: "La plateforme d'emploi sérieuse du Congo-Brazzaville. Trouvez votre emploi à Pointe-Noire, Brazzaville et dans tout le Congo.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: { type: "website", locale: "fr_CG", siteName: "Offres Emploi 242" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <SessionProvider>
          {children}
          <ToastContainer />
        </SessionProvider>
      </body>
    </html>
  );
}
