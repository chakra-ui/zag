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
    closeOnSelect: false,
  })

  const api = datePicker.connect(service, normalizeProps)

  // Get time from the selected value (if it has time components)
  const selectedValue = api.value[0]
  const hasTime = selectedValue && "hour" in selectedValue
  const timeValue = hasTime
    ? `${String(selectedValue.hour).padStart(2, "0")}:${String(selectedValue.minute).padStart(2, "0")}`
    : "12:00"

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(":").map(Number)
    if (!isNaN(hours) && !isNaN(minutes)) {
      api.setTime({ hour: hours, minute: minutes, second: 0 })
    }
  }

  // Format the full date-time string
  const dateTimeString = selectedValue
    ? hasTime
      ? `${selectedValue.year}-${String(selectedValue.month).padStart(2, "0")}-${String(selectedValue.day).padStart(2, "0")} ${String(selectedValue.hour).padStart(2, "0")}:${String(selectedValue.minute).padStart(2, "0")}`
      : `${selectedValue.year}-${String(selectedValue.month).padStart(2, "0")}-${String(selectedValue.day).padStart(2, "0")}`
    : "-"

  return (
    <>
      <main className="date-picker">
        <div>
          <h2>Date-Time Picker Example</h2>
          <p>Combines Zag date picker with native time input using the new setTime API</p>
        </div>

        <output className="date-output">
          <div>Selected DateTime: {dateTimeString}</div>
          <div>Has Time: {hasTime ? "Yes" : "No"}</div>
        </output>

        <div
          {...api.getControlProps()}
          style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "16px" }}
        >
          {/* Date-Time Trigger */}
          <button {...api.getTriggerProps()}>
            {selectedValue
              ? hasTime
                ? `${selectedValue.year}-${String(selectedValue.month).padStart(2, "0")}-${String(selectedValue.day).padStart(2, "0")} ${String(selectedValue.hour).padStart(2, "0")}:${String(selectedValue.minute).padStart(2, "0")}`
                : `${selectedValue.year}-${String(selectedValue.month).padStart(2, "0")}-${String(selectedValue.day).padStart(2, "0")}`
              : "Select Date & Time"}
          </button>

          {/* Clear Button */}
          <button {...api.getClearTriggerProps()}>Clear</button>
        </div>

        <div {...api.getPositionerProps()}>
          <div {...api.getContentProps()}>
            {/* Day View */}
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

              {/* Time Picker inside content */}
              <div
                style={{
                  borderTop: "1px solid #e2e8f0",
                  marginTop: "12px",
                  paddingTop: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <label style={{ fontSize: "14px", fontWeight: 500 }}>Time:</label>
                <input
                  type="time"
                  value={timeValue}
                  onChange={handleTimeChange}
                  disabled={!selectedValue}
                  style={{
                    padding: "6px 8px",
                    fontSize: "14px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "4px",
                    flex: 1,
                  }}
                />
              </div>
            </div>

            {/* Month View */}
            <div hidden={api.view !== "month"} style={{ width: "100%" }}>
              <div {...api.getViewControlProps({ view: "month" })}>
                <button {...api.getPrevTriggerProps({ view: "month" })}>Prev</button>
                <button {...api.getViewTriggerProps({ view: "month" })}>{api.visibleRange.start.year}</button>
                <button {...api.getNextTriggerProps({ view: "month" })}>Next</button>
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

            {/* Year View */}
            <div hidden={api.view !== "year"} style={{ width: "100%" }}>
              <div {...api.getViewControlProps({ view: "year" })}>
                <button {...api.getPrevTriggerProps({ view: "year" })}>Prev</button>
                <span>
                  {api.getDecade().start} - {api.getDecade().end}
                </span>
                <button {...api.getNextTriggerProps({ view: "year" })}>Next</button>
              </div>

              <table {...api.getTableProps({ view: "year", columns: 4 })}>
                <tbody {...api.getTableBodyProps()}>
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
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} omit={["weeks"]} />
      </Toolbar>
    </>
  )
}
