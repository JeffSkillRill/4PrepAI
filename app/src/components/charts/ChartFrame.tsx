export type ChartRow = { label: string; value: string; note?: string }

/**
 * Shared shell for every chart on the profile.
 *
 * The drawing carries `role="img"` with a full spoken summary, which hides its
 * internals from assistive technology on purpose. The equivalent table is a
 * sibling rather than a child, so it stays reachable instead of being hidden
 * inside the image role.
 */
export function ChartFrame({
  summary,
  tableCaption,
  rows,
  children,
  footer,
  className = '',
}: {
  summary: string
  tableCaption: string
  rows: ChartRow[]
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}) {
  return (
    <figure className={`m-0 rounded-2xl border border-line bg-white p-4 sm:p-5 ${className}`}>
      <div className="chart-focusable rounded-xl" role="img" aria-label={summary} tabIndex={0}>
        {children}
      </div>
      {footer && <figcaption className="mt-4 border-t border-line pt-3 text-xs leading-5 text-muted">{footer}</figcaption>}
      <div className="sr-only">
        <table>
          <caption>{tableCaption}</caption>
          <thead><tr><th>Item</th><th>Published value</th><th>Note</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <th>{row.label}</th>
                <td>{row.value}</td>
                <td>{row.note ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  )
}
