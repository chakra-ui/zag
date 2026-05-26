import { getLocalTimeZone } from "@internationalized/date"
import * as datePicker from "@zag-js/date-picker"
import { normalizeProps, useMachine } from "@zag-js/react"
import { datePickerControls } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

export default function Page() {
  const controls = useControls(datePickerControls)
  const tableId = useId()

  const service = useMachine(datePicker.machine, {
    id: useId(),
    locale: "en-US",
    numOfMonths: 1,
    selectionMode: "range",
    outsideDaySelectable: true,
    inline: true,
    timeZone: getLocalTimeZone(),
    ...controls.context,
  })

  const api = datePicker.connect(service, normalizeProps)

  return (
    <>
      <main className="date-picker">
        <div>
          <button type="button">Outside Element</button>
        </div>

        <p>
          <strong>Inline range · single month · outside days selectable</strong>
        </p>
        <p>
          Click two dates for a range, then hover outside-month cells before the second click — the visible month should
          stay put.
        </p>
        <p>{`Visible range: ${api.visibleRangeText.formatted}`}</p>

        <output className="date-output">
          <div>Selected: {api.valueAsString.join(" → ") || "-"}</div>
          <div>Focused: {api.focusedValueAsString}</div>
        </output>

        <div style={{ marginBottom: "12px" }}>
          <button type="button" {...api.getClearTriggerProps()}>
            Clear
          </button>
        </div>

        <div {...api.getRootProps()}>
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
              <div {...api.getViewControlProps({ view: "day" })}>
                <button type="button" {...api.getPrevTriggerProps()}>
                  Prev
                </button>
                <button type="button" {...api.getViewTriggerProps()}>
                  {api.visibleRangeText.start}
                </button>
                <button type="button" {...api.getNextTriggerProps()}>
                  Next
                </button>
              </div>

              <table {...api.getTableProps({ view: "day", id: tableId })}>
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
                      {week.map((value, j) => (
                        <td key={j} {...api.getDayTableCellProps({ value })}>
                          <div {...api.getDayTableCellTriggerProps({ value })}>{value.day}</div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: "flex", gap: "40px" }}>
              <div hidden={api.view !== "month"} style={{ width: "100%" }}>
                <div {...api.getViewControlProps({ view: "month" })}>
                  <button type="button" {...api.getPrevTriggerProps({ view: "month" })}>
                    Prev
                  </button>
                  <button type="button" {...api.getViewTriggerProps({ view: "month" })}>
                    {api.visibleRange.start.year}
                  </button>
                  <button type="button" {...api.getNextTriggerProps({ view: "month" })}>
                    Next
                  </button>
                </div>

                <table {...api.getTableProps({ view: "month", columns: 4 })}>
                  <tbody {...api.getTableBodyProps({ view: "month" })}>
                    {api.getMonthsGrid({ columns: 4, format: "short" }).map((months, row) => (
                      <tr key={row} {...api.getTableRowProps()}>
                        {months.map((month, index) => (
                          <td key={index} {...api.getMonthTableCellProps({ ...month, columns: 4 })}>
                            <div {...api.getMonthTableCellTriggerProps({ ...month, columns: 4 })}>{month.label}</div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div hidden={api.view !== "year"} style={{ width: "100%" }}>
                <div {...api.getViewControlProps({ view: "year" })}>
                  <button type="button" {...api.getPrevTriggerProps({ view: "year" })}>
                    Prev
                  </button>
                  <span>
                    {api.getDecade().start} - {api.getDecade().end}
                  </span>
                  <button type="button" {...api.getNextTriggerProps({ view: "year" })}>
                    Next
                  </button>
                </div>

                <table {...api.getTableProps({ view: "year", columns: 4 })}>
                  <tbody {...api.getTableBodyProps({ view: "year" })}>
                    {api.getYearsGrid({ columns: 4 }).map((years, row) => (
                      <tr key={row} {...api.getTableRowProps({ view: "year" })}>
                        {years.map((year, index) => (
                          <td key={index} {...api.getYearTableCellProps({ ...year, columns: 4 })}>
                            <div {...api.getYearTableCellTriggerProps({ ...year, columns: 4 })}>{year.label}</div>
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
        <StateVisualizer state={service} omit={["weeks"]} />
      </Toolbar>
    </>
  )
}
