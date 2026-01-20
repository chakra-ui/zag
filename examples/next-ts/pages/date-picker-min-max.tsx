import * as datePicker from "@zag-js/date-picker"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default function Page() {
  const service = useMachine(datePicker.machine, {
    id: useId(),
    locale: "en",
    selectionMode: "single",
    min: datePicker.parse("2025-07-01"),
    max: datePicker.parse("2025-09-30"),
  })

  const api = datePicker.connect(service, normalizeProps)

  return (
    <>
      <main className="date-picker">
        <p>{`Visible range: ${api.visibleRangeText.formatted}`}</p>

        <output className="date-output">
          <div>Selected: {api.valueAsString ?? "-"}</div>
          <div>Focused: {api.focusedValueAsString}</div>
          <div>Placeholder: {api.placeholderValueAsString}</div>
        </output>

        <div {...api.getControlProps()}>
          <input {...api.getInputProps()} />
          <button {...api.getClearTriggerProps()}>❌</button>
          <button {...api.getTriggerProps()}>🗓</button>
        </div>

        <div {...api.getPositionerProps()}>
          <div {...api.getContentProps()}>
            <div style={{ marginBottom: "20px" }}>
              <select {...api.getMonthSelectProps()}>
                {api.getMonths().map((month, i) => (
                  <option key={i} value={month.value} disabled={month.disabled}>
                    {month.label}
                  </option>
                ))}
              </select>

              <select {...api.getYearSelectProps()}>
                {api.getYears().map((year, i) => (
                  <option key={i} value={year.value} disabled={year.disabled}>
                    {year.label}
                  </option>
                ))}
              </select>
            </div>

            <div hidden={api.view !== "day"}>
              <div {...api.getViewControlProps({ view: "year" })}>
                <button {...api.getPrevTriggerProps()}>Prev</button>
                <button {...api.getViewTriggerProps()}>{api.visibleRangeText.start}</button>
                <button {...api.getNextTriggerProps()}>Next</button>
              </div>

              <table {...api.getTableProps({ view: "day" })}>
                <thead {...api.getTableHeaderProps({ view: "day" })}>
                  <tr {...api.getTableRowProps({ view: "day" })}>
                    {api.weekDays.map((day, i) => (
                      <th scope="col" key={i} aria-label={day.long}>
                        {day.narrow}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody {...api.getTableBodyProps({ view: "day" })}>
                  {api.weeks.map((week, i) => (
                    <tr key={i} {...api.getTableRowProps({ view: "day" })}>
                      {week.map((value, i) => (
                        <td key={i} {...api.getDayTableCellProps({ value })}>
                          <div {...api.getDayTableCellTriggerProps({ value })}>{value.day}</div>
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

      <Toolbar viz>
        <StateVisualizer state={service} omit={["weeks"]} />
      </Toolbar>
    </>
  )
}
