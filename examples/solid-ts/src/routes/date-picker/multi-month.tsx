import * as datePicker from "@zag-js/date-picker"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Index, createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/date-picker.css"

export default function Page() {
  const service = useMachine(datePicker.machine, {
    id: createUniqueId(),
    locale: "en",
    selectionMode: "multiple",
    minView: "month",
    maxSelectedDates: 2,
  })

  const api = createMemo(() => datePicker.connect(service, normalizeProps))

  return (
    <>
      <main class="date-picker">
        <output class="date-output">
          <div>Selected: {api().valueAsString ?? "-"}</div>
        </output>

        <div {...api().getControlProps()}>
          <input {...api().getInputProps()} />
          <button {...api().getTriggerProps()}>🗓</button>
        </div>

        <div {...api().getPositionerProps()}>
          <div {...api().getContentProps()}>
            <div hidden={api().view !== "month"}>
              <div {...api().getViewControlProps({ view: "month" })}>
                <button {...api().getPreviousTriggerProps({ view: "month" })}>Prev</button>
                <button {...api().getViewTriggerProps({ view: "month" })}>{api().visibleRange.start.year}</button>
                <button {...api().getNextTriggerProps({ view: "month" })}>Next</button>
              </div>

              <table {...api().getTableProps({ view: "month", columns: 4 })}>
                <tbody {...api().getTableBodyProps({ view: "month" })}>
                  <Index each={api().getMonthsGrid({ columns: 4, format: "short" })}>
                    {(months) => (
                      <tr {...api().getTableRowProps()}>
                        <Index each={months()}>
                          {(month) => (
                            <td {...api().getMonthTableCellProps({ ...month(), columns: 4 })}>
                              <div {...api().getMonthTableCellTriggerProps({ ...month(), columns: 4 })}>
                                {month().label}
                              </div>
                            </td>
                          )}
                        </Index>
                      </tr>
                    )}
                  </Index>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} omit={["weeks"]} />
      </Toolbar>
    </>
  )
}
