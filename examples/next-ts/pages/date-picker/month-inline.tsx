import { parseDate } from "@internationalized/date"
import * as datePicker from "@zag-js/date-picker"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

// an inline month view constrained to march through september
export default function Page() {
  const service = useMachine(datePicker.machine, {
    id: useId(),
    defaultView: "month",
    minView: "month",
    inline: true,
    defaultFocusedValue: parseDate("2026-06-01"),
    min: parseDate("2026-03-01"),
    max: parseDate("2026-09-30"),
  })

  const api = datePicker.connect(service, normalizeProps)

  return (
    <main>
      <div data-testid="selected">{api.valueAsString.join(",") || "none"}</div>
      <div data-testid="focused">{api.focusedValueAsString}</div>
      <div {...api.getContentProps()}>
        <table {...api.getTableProps({ view: "month", columns: 4 })}>
          <tbody {...api.getTableBodyProps()}>
            {api.getMonthsGrid({ columns: 4, format: "short" }).map((months, row) => (
              <tr key={row} {...api.getTableRowProps({ view: "month" })}>
                {months.map((month) => (
                  <td key={month.value} {...api.getMonthTableCellProps({ ...month, columns: 4 })}>
                    <div {...api.getMonthTableCellTriggerProps({ ...month, columns: 4 })}>{month.label}</div>
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
