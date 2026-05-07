import { BanyaInfo } from '../types'

interface Props {
  banya: BanyaInfo
}

export function BanyaCard({ banya }: Props) {
  const rating = banya.rating ?? 0
  const stars = Math.min(5, Math.round(rating))

  return (
    <div
      className="rounded-xl p-3.5 my-1 transition-shadow hover:shadow-md"
      style={{ background: '#fff9f5', border: '1px solid #fed7aa' }}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-stone-800 text-sm leading-snug">{banya.name}</h3>
        {rating > 0 && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="text-yellow-400 text-xs">{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</span>
            <span className="text-stone-400 text-xs">{rating.toFixed(1)}</span>
          </div>
        )}
      </div>
      <div className="mt-1.5 space-y-0.5">
        {banya.address && (
          <p className="text-stone-500 text-xs flex items-start gap-1.5">
            <span className="mt-px">📍</span><span>{banya.address}</span>
          </p>
        )}
        {banya.phone && (
          <p className="text-stone-500 text-xs flex items-center gap-1.5">
            <span>📞</span><span>{banya.phone}</span>
          </p>
        )}
        {banya.schedule && (
          <p className="text-stone-500 text-xs flex items-start gap-1.5">
            <span className="mt-px">🕐</span><span>{banya.schedule}</span>
          </p>
        )}
      </div>
    </div>
  )
}
