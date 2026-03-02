import * as datePicker from "@zag-js/date-picker"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

export default function Page() {
  const service = useMachine(datePicker.machine, {
    id: useId(),
    locale: "en",
    selectionMode: "single",
    numOfMonths: 2,
  })

  const api = datePicker.connect(service, normalizeProps)
  const offset = api.getOffset({ months: 1 })

  return (
    <main className="date-picker">
      <div>
        <button>Outside Element</button>
      </div>
      <p>{`Visible range: ${api.visibleRangeText.formatted}`}</p>

      <output className="date-output">
        <div>Selected: {api.valueAsString ?? "-"}</div>
        <div>Focused: {api.focusedValueAsString}</div>
      </output>

      <div {...api.getControlProps()}>
        <input {...api.getInputProps()} />
        <button {...api.getClearTriggerProps()}>❌</button>
        <button {...api.getTriggerProps()}>🗓</button>
      </div>

      <div {...api.getPositionerProps()}>
        <div {...api.getContentProps()}>
          <div style={{ display: "flex", gap: "10px" }}>
            <button {...api.getPrevTriggerProps()}>Prev</button>
            <button {...api.getNextTriggerProps()}>Next</button>
          </div>

          <hr />

          <div>{api.visibleRangeText.start}</div>

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

          <hr />

          <div>{offset.visibleRangeText.start}</div>

          <table {...api.getTableProps({ view: "day" })}>
            <thead {...api.getTableHeaderProps()}>
              <tr {...api.getTableRowProps()}>
                {api.weekDays.map((day, i) => (
                  <th scope="col" key={i} aria-label={day.long}>
                    {day.narrow}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody {...api.getTableBodyProps({ view: "day" })}>
              {offset.weeks.map((week, i) => (
                <tr key={i} {...api.getTableRowProps({ view: "day" })}>
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

        <div style={{ display: "flex", gap: "40px" }}>
          <div {...api.getViewProps({ view: "month" })}>
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

          <div {...api.getViewProps({ view: "year" })}>
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
  )
}
