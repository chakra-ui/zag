import { CalendarDate } from "@internationalized/date"
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
      max: new CalendarDate(2023, 4, 20),
      min: new CalendarDate(2010, 1, 20),
    }),
    {
      context: controls.context,
    },
  )

  const api = datePicker.connect(state, send, normalizeProps)

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

        <div {...api.contentProps}>
          <div style={{ marginBlock: "20px" }}>
            <select {...api.monthSelectProps}>
              {api.getMonths().map((month, i) => (
                <option key={i} value={i + 1}>
                  {month}
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

          <div hidden={api.view !== "day"} style={{ maxWidth: "230px" }}>
            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBlock: "10px" }}
            >
              <button {...api.getPrevTriggerProps()}>Prev</button>
              <button {...api.viewTriggerProps} style={{ border: "0", padding: "4px 20px", borderRadius: "4px" }}>
                {api.visibleRangeText.start}
              </button>
              <button {...api.getNextTriggerProps()}>Next</button>
            </div>

            <table {...api.getGridProps()}>
              <thead {...api.getHeaderProps()}>
                <tr>
                  {api.weekDays.map((day, i) => (
                    <th scope="col" key={i} aria-label={day.long}>
                      {day.narrow}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {api.weeks.map((week, i) => (
                  <tr key={i}>
                    {week.map((value, i) => (
                      <td key={i} {...api.getDayCellProps({ value })}>
                        <div {...api.getDayCellTriggerProps({ value })}>{value.day}</div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: "flex", gap: "40px", marginTop: "24px" }}>
            <div hidden={api.view !== "month"}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBlock: "10px",
                }}
              >
                <button {...api.getPrevTriggerProps({ view: "month" })}>Prev</button>
                <span {...api.viewTriggerProps}>{api.visibleRange.start.year}</span>
                <button {...api.getNextTriggerProps({ view: "month" })}>Next</button>
              </div>

              <table {...api.getGridProps({ view: "month", columns: 4 })}>
                <tbody>
                  {api.getMonths({ columns: 4, format: "short" }).map((months, row) => (
                    <tr key={row}>
                      {months.map((month, index) => {
                        const value = row * 4 + index + 1
                        return (
                          <td key={index} {...api.getMonthCellProps({ value })}>
                            <div {...api.getMonthCellTriggerProps({ value })}>{month}</div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div hidden={api.view !== "year"}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBlock: "10px",
                }}
              >
                <button {...api.getPrevTriggerProps({ view: "year" })}>Prev</button>
                <span>
                  {api.getDecade().start} - {api.getDecade().end}
                </span>
                <button {...api.getNextTriggerProps({ view: "year" })}>Next</button>
              </div>

              <table {...api.getGridProps({ view: "year", columns: 4 })}>
                <tbody>
                  {api.getYears({ columns: 4 }).map((years, row) => (
                    <tr key={row}>
                      {years.map((year, index) => (
                        <td colSpan={4} key={index} {...api.getYearCellProps({ value: year })}>
                          {year}
                        </td>
                      ))}
                    </tr>
                  ))}
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
