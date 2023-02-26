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

  const [state, send] = useMachine(datePicker.machine({ id: useId() }), {
    context: controls.context,
  })

  const api = datePicker.connect(state, send, normalizeProps)

  return (
    <>
      <main className="date-picker">
        <div {...api.rootProps}>
          <output className="date-output">
            <div>Selected: {api.valueAsString ?? "-"}</div>
            <div>Focused: {api.focusedValueAsString}</div>
          </output>
          <div data-scope="date-picker" data-part="control">
            <input {...api.inputProps} />
            <button {...api.triggerProps}>🗓</button>
          </div>
          <div>
            <button {...api.getPrevTriggerProps()}>Prev</button>
            <button {...api.getNextTriggerProps()}>Next</button>
            <button {...api.clearTriggerProps}>❌</button>
          </div>

          <div style={{ marginBlock: "20px" }}>
            <select
              defaultValue={api.focusedValue.month}
              onChange={(e) => {
                api.focusMonth(parseInt(e.target.value))
              }}
            >
              {api.getMonths().map((month, i) => (
                <option key={i} value={i + 1}>
                  {month}
                </option>
              ))}
            </select>

            <select
              defaultValue={api.focusedValue.year}
              onChange={(e) => {
                api.focusYear(parseInt(e.target.value))
              }}
            >
              {getYearsRange({ from: 2000, to: 2030 }).map((year, i) => (
                <option key={i} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <table {...api.getGridProps()}>
            <thead>
              <tr>
                {api.weekDays.map((day, i) => (
                  <th key={i}>{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {api.weeks.map((week, i) => (
                <tr key={i}>
                  {week.map((date, i) => (
                    <td key={i} {...api.getDayCellProps({ value: date })}>
                      {date.day}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: "flex", gap: "40px", marginTop: "24px" }}>
            <table>
              <tbody>
                {api.getMonths({ columns: 4 }).map((months, row) => (
                  <tr key={row}>
                    {months.map((month, index) => (
                      <td key={index} {...api.getMonthCellProps({ value: row * 4 + index + 1 })}>
                        {month}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <table>
              <tbody>
                {api.getYears({ columns: 4 }).map((years, row) => (
                  <tr key={row}>
                    {years.map((year, index) => (
                      <td key={index} {...api.getYearCellProps({ value: year })}>
                        {year}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Toolbar viz controls={controls.ui}>
        <StateVisualizer state={state} omit={["weeks", "weekDays"]} />
      </Toolbar>
    </>
  )
}
