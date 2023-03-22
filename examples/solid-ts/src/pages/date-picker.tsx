import { CalendarDate } from "@internationalized/date"
import * as datePicker from "@zag-js/date-picker"
import { getYearsRange } from "@zag-js/date-utils"
import { datePickerControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, For } from "solid-js"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(datePickerControls)
  const [state, send] = useMachine(
    datePicker.machine({
      id: createUniqueId(),
      locale: "en",
      selectionMode: "single",
      max: new CalendarDate(2023, 4, 20),
      min: new CalendarDate(2010, 1, 20),
    }),
    {
      context: controls.context,
    },
  )

  const api = createMemo(() => datePicker.connect(state, send, normalizeProps))

  return (
    <>
      <main class="date-picker">
        <div>
          <button>Outside Element</button>
        </div>
        <p>{`Visible range: ${api().visibleRangeText.formatted}`}</p>

        <output class="date-output">
          <div>Selected: {api().valueAsString ?? "-"}</div>
          <div>Focused: {api().focusedValueAsString}</div>
        </output>

        <div {...api().controlProps}>
          <input {...api().inputProps} />
          <button {...api().clearTriggerProps}>❌</button>
          <button {...api().triggerProps}>🗓</button>
        </div>

        <div {...api().contentProps}>
          <div style={{ "margin-block": "20px" }}>
            <select {...api().monthSelectProps}>
              <For each={api().getMonths()}>
                {(month, i) => (
                  <option value={i() + 1} selected={api().focusedValue.month === i() + 1}>
                    {month}
                  </option>
                )}
              </For>
            </select>

            <select {...api().yearSelectProps}>
              <For each={getYearsRange({ from: 1_000, to: 4_000 })}>
                {(year) => (
                  <option value={year} selected={api().focusedValue.year === year}>
                    {year}
                  </option>
                )}
              </For>
            </select>
          </div>

          <div hidden={api().view !== "day"} style={{ "max-width": "230px" }}>
            <div
              style={{
                display: "flex",
                "justify-content": "space-between",
                "align-items": "center",
                "margin-block": "10px",
              }}
            >
              <button {...api().getPrevTriggerProps()}>Prev</button>
              <button {...api().viewTriggerProps} style={{ border: "0", padding: "4px 20px", "border-radius": "4px" }}>
                {api().visibleRangeText.start}
              </button>
              <button {...api().getNextTriggerProps()}>Next</button>
            </div>

            <table {...api().getGridProps()}>
              <thead {...api().getHeaderProps()}>
                <tr>
                  <For each={api().weekDays}>
                    {(day) => (
                      <th scope="col" aria-label={day.long}>
                        {day.narrow}
                      </th>
                    )}
                  </For>
                </tr>
              </thead>
              <tbody>
                <For each={api().weeks}>
                  {(week) => (
                    <tr>
                      <For each={week}>
                        {(value, i) => {
                          if (value === null) return <td />
                          return (
                            <td {...api().getDayCellProps({ value })}>
                              <div {...api().getDayCellTriggerProps({ value })}>{value.day}</div>
                            </td>
                          )
                        }}
                      </For>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>

          <div style={{ display: "flex", gap: "40px", "margin-top": "24px" }}>
            <div hidden={api().view !== "month"}>
              <div
                style={{
                  display: "flex",
                  "justify-content": "space-between",
                  "align-items": "center",
                  "margin-block": "10px",
                }}
              >
                <button {...api().getPrevTriggerProps({ view: "month" })}>Prev</button>
                <button {...api().viewTriggerProps}>{api().visibleRange.start.year}</button>
                <button {...api().getNextTriggerProps({ view: "month" })}>Next</button>
              </div>

              <table {...api().getGridProps({ view: "month", columns: 4 })}>
                <tbody>
                  <For each={api().getMonths({ columns: 4, format: "short" })}>
                    {(months, row) => (
                      <tr>
                        <For each={months}>
                          {(month, index) => {
                            const value = row() * 4 + index() + 1
                            return (
                              <td {...api().getMonthCellProps({ value })}>
                                <div {...api().getMonthCellTriggerProps({ value })}>{month}</div>
                              </td>
                            )
                          }}
                        </For>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>

            <div hidden={api().view !== "year"}>
              <div
                style={{
                  display: "flex",
                  "justify-content": "space-between",
                  "align-items": "center",
                  "margin-block": "10px",
                }}
              >
                <button {...api().getPrevTriggerProps({ view: "year" })}>Prev</button>
                <span>
                  {api().getDecade().start} - {api().getDecade().end}
                </span>
                <button {...api().getNextTriggerProps({ view: "year" })}>Next</button>
              </div>

              <table {...api().getGridProps({ view: "year", columns: 4 })}>
                <tbody>
                  <For each={api().getYears({ columns: 4 })}>
                    {(years) => (
                      <tr>
                        <For each={years}>
                          {(year) => (
                            <td colSpan={4} {...api().getYearCellProps({ value: year })}>
                              {year}
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

      <Toolbar viz controls={controls.ui}>
        <StateVisualizer state={state} omit={["weeks"]} />
      </Toolbar>
    </>
  )
}
