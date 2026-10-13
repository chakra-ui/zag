import { parseDate } from "@internationalized/date"
import * as datePicker from "@zag-js/date-picker"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Index, createMemo, createUniqueId } from "solid-js"

// an inline year view that renders beyond the decade in view, with min 2015 and max 2035
export default function Page() {
  const service = useMachine(datePicker.machine, {
    id: createUniqueId(),
    defaultView: "year",
    inline: true,
    min: parseDate("2015-01-01"),
    max: parseDate("2035-12-31"),
  })

  const api = createMemo(() => datePicker.connect(service, normalizeProps))

  const decade = createMemo(() => api().getDecade())
  const years = createMemo(() => {
    const start = (decade().start ?? 2020) - 10
    return Array.from({ length: 30 }, (_, i) => ({ label: String(start + i), value: start + i }))
  })
  const rows = Array.from({ length: 6 }, (_, row) => row)

  return (
    <main>
      <div data-testid="decade">{`${decade().start}-${decade().end}`}</div>
      <div data-testid="selected">{api().valueAsString.join(",") || "none"}</div>
      <div {...api().getContentProps()}>
        <table {...api().getTableProps({ view: "year", columns: 5 })}>
          <tbody {...api().getTableBodyProps()}>
            <Index each={rows}>
              {(row) => (
                <tr {...api().getTableRowProps({ view: "year" })}>
                  <Index each={years().slice(row() * 5, row() * 5 + 5)}>
                    {(year) => (
                      <td {...api().getYearTableCellProps({ ...year(), columns: 5 })}>
                        <div {...api().getYearTableCellTriggerProps({ ...year(), columns: 5 })}>{year().label}</div>
                      </td>
                    )}
                  </Index>
                </tr>
              )}
            </Index>
          </tbody>
        </table>
      </div>
    </main>
  )
}
