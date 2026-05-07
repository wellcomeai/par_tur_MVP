import { BanyaInfo } from '../types'

interface Props {
  banya: BanyaInfo
}

export function BanyaCard({ banya }: Props) {
  const stars = Math.round(banya.rating)

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 my-2 hover:border-orange-500 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-white text-sm">{banya.name}</h3>
        {banya.rating > 0 && (
          <span className="text-yellow-400 text-xs whitespace-nowrap">
            {'⭐'.repeat(stars)} {banya.rating.toFixed(1)}
          </span>
        )}
      </div>
      {banya.address && (
        <p className="text-gray-400 text-xs mt-1">📍 {banya.address}</p>
      )}
      {banya.phone && (
        <p className="text-gray-400 text-xs mt-1">📞 {banya.phone}</p>
      )}
      {banya.schedule && (
        <p className="text-gray-400 text-xs mt-1">🕐 {banya.schedule}</p>
      )}
    </div>
  )
}
