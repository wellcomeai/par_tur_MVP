import { useState } from 'react'
import { BanyaInfo } from '../types'

interface Props {
  banya: BanyaInfo
}

export function BanyaCard({ banya }: Props) {
  const [imgError, setImgError] = useState(false)
  const rating = banya.rating ?? 0
  const stars = Math.min(5, Math.round(rating))
  const photo = banya.photos?.[0]

  return (
    <div
      className="rounded-xl overflow-hidden my-1 transition-shadow hover:shadow-md"
      style={{ background: '#fff9f5', border: '1px solid #fed7aa' }}
    >
      {photo && !imgError && (
        <img
          src={photo}
          alt={banya.name}
          className="w-full h-36 object-cover"
          onError={() => setImgError(true)}
        />
      )}

      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-stone-800 text-sm leading-snug">{banya.name}</h3>
          {rating > 0 && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-yellow-400 text-xs leading-none">
                {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
              </span>
              <span className="text-stone-700 text-xs font-medium">{rating.toFixed(1)}</span>
              {banya.reviews_count > 0 && (
                <span className="text-stone-400 text-xs">({banya.reviews_count})</span>
              )}
            </div>
          )}
        </div>

        {banya.rubrics && banya.rubrics.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {banya.rubrics.slice(0, 3).map((r, i) => (
              <span
                key={i}
                className="text-xs px-1.5 py-0.5 rounded-full"
                style={{ background: '#fff1e6', color: '#c2410c', border: '1px solid #fed7aa' }}
              >
                {r}
              </span>
            ))}
          </div>
        )}

        <div className="mt-2 space-y-1">
          {banya.address && (
            <p className="text-stone-500 text-xs flex items-start gap-1.5">
              <span className="mt-px flex-shrink-0">📍</span>
              <span>{banya.address}</span>
            </p>
          )}
          {banya.phone && (
            <p className="text-stone-500 text-xs flex items-center gap-1.5">
              <span className="flex-shrink-0">📞</span>
              <a
                href={`tel:${banya.phone.replace(/\D/g, '')}`}
                className="hover:text-orange-600 transition-colors"
              >
                {banya.phone}
              </a>
            </p>
          )}
          {banya.schedule && (
            <p className="text-stone-500 text-xs flex items-start gap-1.5">
              <span className="mt-px flex-shrink-0">🕐</span>
              <span>{banya.schedule}</span>
            </p>
          )}
          {banya.website && (
            <p className="text-stone-500 text-xs flex items-center gap-1.5">
              <span className="flex-shrink-0">🌐</span>
              <a
                href={banya.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-orange-600 transition-colors truncate"
              >
                {banya.website.replace(/^https?:\/\/(www\.)?/, '')}
              </a>
            </p>
          )}
        </div>

        {banya.description && (
          <p className="mt-2 text-stone-500 text-xs leading-relaxed line-clamp-3">
            {banya.description}
          </p>
        )}
      </div>
    </div>
  )
}
