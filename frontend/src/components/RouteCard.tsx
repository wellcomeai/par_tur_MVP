import { RouteInfo } from '../types'

interface Props {
  route: RouteInfo
}

export function RouteCard({ route }: Props) {
  return (
    <div className="bg-gray-800 border border-orange-500 rounded-xl p-4 my-2">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-orange-400 text-lg">🗺️</span>
        <h3 className="font-semibold text-orange-400">
          ПарТур по {route.region} — {route.total_banyas} бани
        </h3>
      </div>
      <p className="text-gray-400 text-xs mb-3">
        Примерное время: {route.estimated_duration}
      </p>
      <div className="space-y-3">
        {route.route.map((stop) => (
          <div key={stop.order} className="flex gap-3">
            <div className="flex-shrink-0 w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {stop.order}
            </div>
            <div>
              <p className="text-white text-sm font-medium">{stop.name}</p>
              <p className="text-gray-400 text-xs">{stop.address}</p>
              <p className="text-orange-300 text-xs mt-0.5 italic">{stop.tip}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
