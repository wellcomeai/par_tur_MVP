import { CompareInfo } from '../types'

interface Props {
  data: CompareInfo
}

export function CompareTable({ data }: Props) {
  if (!data.rows.length) return null

  return (
    <div className="my-1 overflow-x-auto rounded-xl" style={{ border: '1px solid #e7e5e0' }}>
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr style={{ background: '#f5f4f1' }}>
            {data.columns.map((col) => (
              <th
                key={col}
                className="text-left px-3 py-2 text-stone-500 font-medium whitespace-nowrap"
                style={{ borderBottom: '1px solid #e7e5e0' }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, idx) => (
            <tr
              key={idx}
              style={{ background: idx % 2 === 0 ? '#ffffff' : '#fafaf9', borderBottom: '1px solid #f0ede8' }}
            >
              <td className="px-3 py-2 text-stone-700 font-medium">{row.name}</td>
              <td className="px-3 py-2 text-stone-500">{row.address}</td>
              <td className="px-3 py-2 text-yellow-500 font-medium">
                {row.rating > 0 ? `★ ${row.rating.toFixed(1)}` : '—'}
              </td>
              <td className="px-3 py-2 text-stone-500">{row.phone || '—'}</td>
              <td className="px-3 py-2 text-stone-500">{row.schedule || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
