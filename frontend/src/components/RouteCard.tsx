import { RouteInfo } from '../types'

interface Props {
  route: RouteInfo
}

export function RouteCard({ route }: Props) {
  return (
    <div
      className="rounded-xl p-4 my-1"
      style={{ background: '#fff7ed', border: '1px solid #fdba74' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🗺️</span>
        <div>
          <h3 className="font-semibold text-orange-700 text-sm">
            ПарТур по {route.region}
          </h3>
          <p className="text-orange-400 text-xs">{route.total_banyas} бани · {route.estimated_duration}</p>
        </div>
      </div>
      <div className="space-y-3">
        {route.route.map((stop) => (
          <div key={stop.order} className="flex gap-3">
            <div
              className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5"
              style={{ background: '#f97316' }}
            >
              {stop.order}
            </div>
            <div>
              <p className="text-stone-700 text-sm font-medium leading-snug">{stop.name}</p>
              <p className="text-stone-400 text-xs">{stop.address}</p>
              <p className="text-orange-500 text-xs mt-0.5 italic">{stop.tip}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
