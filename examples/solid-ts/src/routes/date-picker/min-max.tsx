import * as datePicker from "@zag-js/date-picker"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { For, createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/date-picker.css"

export default function Page() {
  const service = useMachine(datePicker.machine, {
    id: createUniqueId(),
    locale: "en",
    selectionMode: "single",
    min: datePicker.parse("2025-07-01"),
    max: datePicker.parse("2025-09-30"),
  })

  const api = createMemo(() => datePicker.connect(service, normalizeProps))

  return (
    <>
      <main class="date-picker">
        <p>{`Visible range: ${api().visibleRangeText.formatted}`}</p>

        <output class="date-output">
          <div>Selected: {api().valueAsString ?? "-"}</div>
          <div>Focused: {api().focusedValueAsString}</div>
        </output>

        <div {...api().getControlProps()}>
          <input {...api().getInputProps()} />
          <button {...api().getClearTriggerProps()}>❌</button>
          <button {...api().getTriggerProps()}>🗓</button>
        </div>

        <div {...api().getPositionerProps()}>
          <div {...api().getContentProps()}>
            <div style={{ "margin-bottom": "20px" }}>
              <select {...api().getMonthSelectProps()}>
                <For keyed={false} each={api().getMonths()}>
                  {(month) => (
                    <option value={month().value} disabled={month().disabled}>
                      {month().label}
                    </option>
                  )}
                </For>
              </select>

              <select {...api().getYearSelectProps()}>
                <For keyed={false} each={api().getYears()}>
                  {(year) => (
                    <option value={year().value} disabled={year().disabled}>
                      {year().label}
                    </option>
                  )}
                </For>
              </select>
            </div>

            <div hidden={api().view !== "day"}>
              <div {...api().getViewControlProps({ view: "year" })}>
                <button {...api().getPreviousTriggerProps()}>Prev</button>
                <button {...api().getViewTriggerProps()}>{api().visibleRangeText.start}</button>
                <button {...api().getNextTriggerProps()}>Next</button>
              </div>

              <table {...api().getTableProps({ view: "day" })}>
                <thead {...api().getTableHeaderProps({ view: "day" })}>
                  <tr {...api().getTableRowProps({ view: "day" })}>
                    <For keyed={false} each={api().weekDays}>
                      {(day) => (
                        <th scope="col" aria-label={day().long}>
                          {day().narrow}
                        </th>
                      )}
                    </For>
                  </tr>
                </thead>
                <tbody {...api().getTableBodyProps({ view: "day" })}>
                  <For keyed={false} each={api().weeks}>
                    {(week) => (
                      <tr {...api().getTableRowProps({ view: "day" })}>
                        <For keyed={false} each={week()}>
                          {(value) => (
                            <td {...api().getDayTableCellProps({ value: value() })}>
                              <div {...api().getDayTableCellTriggerProps({ value: value() })}>{value().day}</div>
                            </td>
                          )}
                        </For>
                      </tr>
                    )}
                  </For>
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
