interface Column {
  key: string
  label: string
  render?: (value: any, row: any) => React.ReactNode
}

interface DataTableProps {
  columns: Column[]
  data: any[]
}

export function DataTable({ columns, data }: DataTableProps) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-[--border]">
      <table className="min-w-[600px] w-full text-[13px]">
        <thead className="bg-[--surface-2]">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.5px] text-[--text-3] text-left"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[--border]">
          {data.map((row, i) => (
            <tr key={row.id || i} className="hover:bg-[--surface-2] transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-[--text-2]">
                  {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
