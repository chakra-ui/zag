import * as datePicker from "@zag-js/date-picker"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { datePickerControls } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"
import { Index, createMemo, createUniqueId } from "solid-js"

export default function Page() {
  const controls = useControls(datePickerControls)
  const service = useMachine(datePicker.machine, {
    id: createUniqueId(),
    name: "date[]",
    locale: "en",
    numOfMonths: 2,
    selectionMode: "range",
  })

  const api = createMemo(() => datePicker.connect(service, normalizeProps))
  const offset = createMemo(() => api().getOffset({ months: 1 }))

  return (
    <>
      <main class="date-picker">
        <div>
          <button>Outside Element</button>
        </div>
        <p>{`Visible range: ${api().visibleRangeText.formatted}`}</p>

        <output class="date-output">
          <div>Selected: {api().valueAsString.join(", ") ?? "-"}</div>
          <div>Focused: {api().focusedValueAsString}</div>
        </output>

        <div {...api().getControlProps()}>
          <input {...api().getInputProps({ index: 0 })} />
          <input {...api().getInputProps({ index: 1 })} />
          <button {...api().getClearTriggerProps()}>❌</button>
          <button {...api().getTriggerProps()}>🗓</button>
        </div>

        <div {...api().getPositionerProps()}>
          <div {...api().getContentProps()}>
            <div style={{ "margin-bottom": "20px" }}>
              <select {...api().getMonthSelectProps()}>
                <Index each={api().getMonths()}>
                  {(month, i) => (
                    <option value={i + 1} selected={api().focusedValue.month === i + 1}>
                      {month().label}
                    </option>
                  )}
                </Index>
              </select>

              <select {...api().getYearSelectProps()}>
                <Index each={api().getYears()}>
                  {(year) => (
                    <option value={year().value} selected={api().focusedValue.year === year().value}>
                      {year().label}
                    </option>
                  )}
                </Index>
              </select>
            </div>

            <div>
              <div {...api().getViewControlProps({ view: "year" })}>
                <button {...api().getPrevTriggerProps()}>Prev</button>

                <span>
                  {api().visibleRangeText.start} - {api().visibleRangeText.end}
                </span>

                <button {...api().getNextTriggerProps()}>Next</button>
              </div>

              <div style={{ display: "flex", gap: "24px" }}>
                <table {...api().getTableProps({ id: createUniqueId() })}>
                  <thead {...api().getTableHeaderProps()}>
                    <tr {...api().getTableRowProps()}>
                      <Index each={api().weekDays}>
                        {(day) => (
                          <th scope="col" aria-label={day().long}>
                            {day().narrow}
                          </th>
                        )}
                      </Index>
                    </tr>
                  </thead>

                  <tbody {...api().getTableBodyProps()}>
                    <Index each={api().weeks}>
                      {(week) => (
                        <tr {...api().getTableRowProps()}>
                          <Index each={week()}>
                            {(value) => (
                              <td {...api().getDayTableCellProps({ value: value() })}>
                                <div {...api().getDayTableCellTriggerProps({ value: value() })}>{value().day}</div>
                              </td>
                            )}
                          </Index>
                        </tr>
                      )}
                    </Index>
                  </tbody>
                </table>

                <table {...api().getTableProps({ id: createUniqueId() })}>
                  <thead {...api().getTableHeaderProps()}>
                    <tr {...api().getTableRowProps()}>
                      <Index each={api().weekDays}>
                        {(day) => (
                          <th scope="col" aria-label={day().long}>
                            {day().narrow}
                          </th>
                        )}
                      </Index>
                    </tr>
                  </thead>

                  <tbody {...api().getTableBodyProps()}>
                    <Index each={offset().weeks}>
                      {(week) => (
                        <tr {...api().getTableRowProps()}>
                          <Index each={week()}>
                            {(value) => (
                              <td
                                {...api().getDayTableCellProps({
                                  value: value(),
                                  visibleRange: offset().visibleRange,
                                })}
                              >
                                <div
                                  {...api().getDayTableCellTriggerProps({
                                    value: value(),
                                    visibleRange: offset().visibleRange,
                                  })}
                                >
                                  {value().day}
                                </div>
                              </td>
                            )}
                          </Index>
                        </tr>
                      )}
                    </Index>
                  </tbody>
                </table>

                <div style={{ "min-width": "80px", display: "flex", "flex-direction": "column", gap: "4px" }}>
                  <b>Presets</b>
                  <button {...api().getPresetTriggerProps({ value: "last3Days" })}>Last 3 Days</button>
                  <button {...api().getPresetTriggerProps({ value: "last7Days" })}>Last 7 Days</button>
                  <button {...api().getPresetTriggerProps({ value: "last14Days" })}>Last 14 Days</button>
                  <button {...api().getPresetTriggerProps({ value: "last30Days" })}>Last 30 Days</button>
                  <button {...api().getPresetTriggerProps({ value: "last90Days" })}>Last 90 Days</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Toolbar viz controls={controls.ui}>
        <StateVisualizer state={service} omit={["weeks"]} />
      </Toolbar>
    </>
  )
}
