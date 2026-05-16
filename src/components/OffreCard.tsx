// components/OffreCard.tsx
import Link from 'next/link';

export default function OffreCard({ job }: { job: any }) {
  const bgColor = job.entreprise.isVerifiee ? 'bg-teal-50' : 'bg-purple-50';
  
  return (
    <div className="group bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-xl hover:border-[#7B2D8B]/30 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white bg-gradient-to-br from-[#7B2D8B] to-[#00A99D]`}>
          {job.entreprise.nomEntreprise.substring(0, 2).toUpperCase()}
        </div>
        <div className="flex gap-2">
          {job.isPremium && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">Premium</span>}
          {job.isUrgent && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold animate-pulse">Urgent</span>}
        </div>
      </div>

      <Link href={`/offres/${job.id}`}>
        <h3 className="font-bold text-gray-900 group-hover:text-[#7B2D8B] transition-colors line-clamp-1">{job.titre}</h3>
      </Link>
      <p className="text-sm text-gray-500 mb-4">{job.entreprise.nomEntreprise}</p>

      <div className="flex flex-wrap gap-3 mb-6 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
          {job.ville}
        </span>
        <span className="flex items-center gap-1 font-bold text-[#00A99D]">
          {job.contratType}
        </span>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
        <span className="font-black text-gray-900 text-sm">
          {job.salaireMin ? `${job.salaireMin.toLocaleString()} CFA` : 'Salaire à discuter'}
        </span>
        <Link href={`/offres/${job.id}`} className="text-[#7B2D8B] text-xs font-bold hover:underline">
          Voir plus →
        </Link>
      </div>
    </div>
  );
}