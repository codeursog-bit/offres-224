import Link from "next/link";
import Icon from "@/components/ui/Icon";
export default function Footer() {
  return (
    <footer className="bg-[#0F0A15] text-gray-400 pt-14 pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #7B2D8B, #00A99D)" }}>
                <span className="text-white font-black text-sm">OE</span>
              </div>
              <span className="text-white font-black text-base">Offres Emploi 242</span>
            </div>
            <p className="text-sm leading-relaxed">La plateforme d'emploi sérieuse du Congo-Brazzaville. Connecter les talents et les entreprises depuis Pointe-Noire.</p>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Candidats</h4>
            <ul className="space-y-2 text-sm">
              {[["Offres d'emploi", "/offres"], ["Créer mon profil", "/inscription"], ["Formations", "/formations"], ["Conseils emploi", "/conseils"]].map(([l, h]) => (
                <li key={h}><Link href={h} className="hover:text-[#00A99D] transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Recruteurs</h4>
            <ul className="space-y-2 text-sm">
              {[["Publier une offre", "/inscription"], ["CVthèque", "/inscription"], ["Entreprises", "/entreprises"], ["Tarifs", "#"]].map(([l, h]) => (
                <li key={l}><Link href={h} className="hover:text-[#00A99D] transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li><Icon name="mapPin" className="w-4 h-4 inline mr-1" /> Pointe-Noire, Congo</li>
              <li><a href="mailto:contact@offres242.cg" className="hover:text-[#00A99D] transition-colors">contact@offres242.cg</a></li>
              <li><a href="tel:+242060000000" className="hover:text-[#00A99D] transition-colors">+242 06 000 00 00</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} Offres Emploi Sérieuse 242. Tous droits réservés.</p>
          <div className="flex gap-6">
            <Link href="/cgu" className="hover:text-white transition-colors">CGU</Link>
            <Link href="/confidentialite" className="hover:text-white transition-colors">Confidentialité</Link>
            <Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
