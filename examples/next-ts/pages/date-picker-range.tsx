import * as datePicker from "@zag-js/date-picker"
import { getYearsRange } from "@zag-js/date-utils"
import { normalizeProps, useMachine } from "@zag-js/react"
import { datePickerControls } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(datePickerControls)
  const [state, send] = useMachine(
    datePicker.machine({
      id: useId(),
      locale: "en",
      numOfMonths: 2,
      selectionMode: "range",
    }),
    {
      context: controls.context,
    },
  )

  const api = datePicker.connect(state, send, normalizeProps)
  const offset = api.getOffset({ months: 1 })

  return (
    <>
      <main className="date-picker">
        <div>
          <button>Outside Element</button>
        </div>
        <p>{`Visible range: ${api.visibleRangeText.formatted}`}</p>

        <output className="date-output">
          <div>Selected: {api.valueAsString ?? "-"}</div>
          <div>Focused: {api.focusedValueAsString}</div>
        </output>

        <div {...api.controlProps}>
          <input {...api.inputProps} />
          <button {...api.clearTriggerProps}>❌</button>
          <button {...api.triggerProps}>🗓</button>
        </div>

        <div {...api.positionerProps}>
          <div {...api.contentProps}>
            <div style={{ marginBottom: "20px" }}>
              <select {...api.monthSelectProps}>
                {api.getMonths().map((month, i) => (
                  <option key={i} value={i + 1}>
                    {month.label}
                  </option>
                ))}
              </select>

              <select {...api.yearSelectProps}>
                {getYearsRange({ from: 1_000, to: 4_000 }).map((year, i) => (
                  <option key={i} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div {...api.getViewControlProps({ view: "year" })}>
                <button {...api.getPrevTriggerProps()}>Prev</button>

                <span>
                  {api.visibleRangeText.start} - {api.visibleRangeText.end}
                </span>

                <button {...api.getNextTriggerProps()}>Next</button>
              </div>

              <div style={{ display: "flex", gap: "24px" }}>
                <table {...api.getTableProps({ id: "r1" })}>
                  <thead {...api.getTableHeaderProps()}>
                    <tr {...api.getTableRowProps()}>
                      {api.weekDays.map((day, i) => (
                        <th scope="col" key={i} aria-label={day.long}>
                          {day.narrow}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody {...api.getTableBodyProps()}>
                    {api.weeks.map((week, i) => (
                      <tr key={i} {...api.getTableRowProps()}>
                        {week.map((value, i) => (
                          <td key={i} {...api.getDayTableCellProps({ value })}>
                            <div {...api.getDayTableCellTriggerProps({ value })}>{value.day}</div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>

                <table {...api.getTableProps({ id: "r2" })}>
                  <thead {...api.getTableHeaderProps()}>
                    <tr {...api.getTableRowProps()}>
                      {api.weekDays.map((day, i) => (
                        <th scope="col" key={i} aria-label={day.long}>
                          {day.narrow}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody {...api.getTableBodyProps()}>
                    {offset.weeks.map((week, i) => (
                      <tr key={i} {...api.getTableRowProps()}>
                        {week.map((value, i) => (
                          <td key={i} {...api.getDayTableCellProps({ value, visibleRange: offset.visibleRange })}>
                            <div {...api.getDayTableCellTriggerProps({ value, visibleRange: offset.visibleRange })}>
                              {value.day}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
