import * as datePicker from "@zag-js/date-picker"
import { getDecadeRange, getYearsRange } from "@zag-js/date-utils"
import { normalizeProps, useMachine } from "@zag-js/react"
import { datePickerControls } from "@zag-js/shared"
import { chunk } from "@zag-js/utils"
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
            <button {...api.prevTriggerProps}>Prev</button>
            <button {...api.nextTriggerProps}>Next</button>
            <button {...api.clearTriggerProps}>❌</button>
          </div>

          <select
            defaultValue={api.focusedValue.month}
            onChange={(e) => {
              api.setMonth(parseInt(e.target.value))
            }}
          >
            {api.months.map((month, i) => (
              <option key={i} value={i + 1}>
                {month}
              </option>
            ))}
          </select>

          <select
            defaultValue={api.focusedValue.year}
            onChange={(e) => {
              api.setYear(parseInt(e.target.value))
            }}
          >
            {getYearsRange({ from: 2000, to: 2030 }).map((year, i) => (
              <option key={i} value={year}>
                {year}
              </option>
            ))}
          </select>

          <table {...api.gridProps}>
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
                    <td key={i} {...api.getCellProps({ date })}>
                      {date ? <span {...api.getCellTriggerProps({ date })}>{date.day}</span> : null}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: "flex", gap: "40px" }}>
            <table>
              <tbody>
                {chunk(api.months, 4).map((months, rowIndex) => (
                  <tr key={rowIndex}>
                    {months.map((month, monthIndex) => (
                      <td key={monthIndex} {...api.getMonthTriggerProps({ month: rowIndex * 4 + monthIndex + 1 })}>
                        {month}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <table>
              <tbody>
                {chunk(getDecadeRange(api.focusedValue.year), 4).map((years, rowIndex) => (
                  <tr key={rowIndex}>
                    {years.map((year, index) => (
                      <td key={index} {...api.getYearTriggerProps({ year })}>
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
