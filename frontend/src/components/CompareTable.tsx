import { CompareInfo } from '../types'

interface Props {
  data: CompareInfo
}

export function CompareTable({ data }: Props) {
  if (!data.rows.length) return null

  return (
    <div className="my-2 overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            {data.columns.map((col) => (
              <th
                key={col}
                className="bg-gray-700 text-gray-300 text-left px-3 py-2 border border-gray-600 whitespace-nowrap"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, idx) => (
            <tr key={idx} className="even:bg-gray-800 odd:bg-gray-750">
              <td className="px-3 py-2 border border-gray-600 text-white font-medium">{row.name}</td>
              <td className="px-3 py-2 border border-gray-600 text-gray-300">{row.address}</td>
              <td className="px-3 py-2 border border-gray-600 text-yellow-400">
                {row.rating > 0 ? `⭐ ${row.rating.toFixed(1)}` : '—'}
              </td>
              <td className="px-3 py-2 border border-gray-600 text-gray-300">{row.phone || '—'}</td>
              <td className="px-3 py-2 border border-gray-600 text-gray-300">{row.schedule || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
