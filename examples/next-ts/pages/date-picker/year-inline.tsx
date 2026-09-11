import * as datePicker from "@zag-js/date-picker"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import { parseDate } from "@internationalized/date"

// an inline year view that renders beyond the decade in view, with min 2015 and max 2035
export default function Page() {
  const service = useMachine(datePicker.machine, {
    id: useId(),
    defaultView: "year",
    inline: true,
    min: parseDate("2015-01-01"),
    max: parseDate("2035-12-31"),
  })
  const api = datePicker.connect(service, normalizeProps)

  const decade = api.getDecade()
  const start = (decade.start ?? 2020) - 10
  const years = Array.from({ length: 30 }, (_, i) => ({ label: String(start + i), value: start + i }))

  return (
    <main>
      <div data-testid="decade">{`${decade.start}-${decade.end}`}</div>
      <div data-testid="selected">{api.valueAsString.join(",") || "none"}</div>
      <div {...api.getContentProps()}>
        <table {...api.getTableProps({ view: "year", columns: 5 })}>
          <tbody {...api.getTableBodyProps()}>
            {Array.from({ length: 6 }, (_, row) => (
              <tr key={row} {...api.getTableRowProps({ view: "year" })}>
                {years.slice(row * 5, row * 5 + 5).map((year) => (
                  <td key={year.value} {...api.getYearTableCellProps({ ...year, columns: 5 })}>
                    <div {...api.getYearTableCellTriggerProps({ ...year, columns: 5 })}>{year.label}</div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
