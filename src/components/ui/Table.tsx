import { type ReactNode } from 'react';

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  cell: (row: T, i: number) => ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
}

export function DataTable<T>({ columns, data, emptyMessage = 'No data' }: { columns: DataTableColumn<T>[]; data: T[]; emptyMessage?: ReactNode }) {
  return (
    <div className="overflow-x-auto border border-rule bg-paper-bright">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-paper-deep text-left">
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={[
                  'px-3 py-2 text-2xs font-mono uppercase tracking-datasheet text-ink-600 border-b border-rule',
                  c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : 'text-left',
                  c.className ?? '',
                ].join(' ')}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-3 py-6 text-center text-ink-600 text-sm">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={i} className="odd:bg-paper/30 even:bg-paper-bright hover:bg-paper-deep">
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={[
                      'px-3 py-2 border-b border-rule/60 font-mono tabular-nums text-ink-800',
                      c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : 'text-left',
                      c.className ?? '',
                    ].join(' ')}
                  >
                    {c.cell(row, i)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
