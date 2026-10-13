import { parseDate } from "@internationalized/date"
import * as datePicker from "@zag-js/date-picker"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Index, createMemo, createUniqueId } from "solid-js"

// an inline month view constrained to march through september
export default function Page() {
  const service = useMachine(datePicker.machine, {
    id: createUniqueId(),
    defaultView: "month",
    minView: "month",
    inline: true,
    defaultFocusedValue: parseDate("2026-06-01"),
    min: parseDate("2026-03-01"),
    max: parseDate("2026-09-30"),
  })

  const api = createMemo(() => datePicker.connect(service, normalizeProps))

  return (
    <main>
      <div data-testid="selected">{api().valueAsString.join(",") || "none"}</div>
      <div data-testid="focused">{api().focusedValueAsString}</div>
      <div {...api().getContentProps()}>
        <table {...api().getTableProps({ view: "month", columns: 4 })}>
          <tbody {...api().getTableBodyProps()}>
            <Index each={api().getMonthsGrid({ columns: 4, format: "short" })}>
              {(months) => (
                <tr {...api().getTableRowProps({ view: "month" })}>
                  <Index each={months()}>
                    {(month) => (
                      <td {...api().getMonthTableCellProps({ ...month(), columns: 4 })}>
                        <div {...api().getMonthTableCellTriggerProps({ ...month(), columns: 4 })}>{month().label}</div>
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
