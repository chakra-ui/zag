import styles from "../../../../shared/src/css/date-picker.module.css"
import { CalendarDate, DateValue } from "@internationalized/date"
import * as datePicker from "@zag-js/date-picker"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

// parse dd/mm/yy to DateValue
const parse = (value: string) => {
  // Handle full dd/mm/yy format
  const fullRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/
  const fullMatch = value.match(fullRegex)
  if (fullMatch) {
    const [_, day, month, year] = fullMatch.map(Number)
    try {
      return new CalendarDate(year + 2000, month, day)
    } catch {
      return undefined
    }
  }

  // Handle dd/mm format
  const partialRegex = /^(\d{1,2})\/(\d{1,2})$/
  const partialMatch = value.match(partialRegex)
  if (partialMatch) {
    const [_, day, month] = partialMatch.map(Number)
    const currentYear = new Date().getFullYear()
    try {
      return new CalendarDate(currentYear, month, day)
    } catch {
      return undefined
    }
  }

  // Handle dd format
  const dayRegex = /^(\d{1,2})$/
  const dayMatch = value.match(dayRegex)
  if (dayMatch) {
    const [_, day] = dayMatch.map(Number)
    const currentYear = new Date().getFullYear()
    return new CalendarDate(currentYear, 1, day)
  }

  return undefined
}

// convert DateValue to dd/mm/yy
const format = (date: DateValue) => {
  const day = date.day.toString().padStart(2, "0")
  const month = date.month.toString().padStart(2, "0")
  const year = (date.year % 100).toString().padStart(2, "0")
  return `${day}/${month}/${year}`
}

export default function Page() {
  const service = useMachine(datePicker.machine, {
    id: useId(),
    locale: "en",
    selectionMode: "single",
    parse,
    format,
    placeholder: "dd/mm/yy",
  })

  const api = datePicker.connect(service, normalizeProps)

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

      <div {...api.getControlProps()} className={styles.Control}>
        <input {...api.getInputProps()} />
        <button {...api.getClearTriggerProps()}>❌</button>
        <button {...api.getTriggerProps()} className={styles.Trigger}>🗓</button>
      </div>

      <div {...api.getPositionerProps()}>
        <div {...api.getContentProps()} className={styles.Content}>
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
            <div {...api.getViewControlProps({ view: "year" })} className={styles.ViewControl}>
              <button {...api.getPrevTriggerProps()}>Prev</button>
              <button {...api.getViewTriggerProps()} className={styles.ViewTrigger}>{api.visibleRangeText.start}</button>
              <button {...api.getNextTriggerProps()}>Next</button>
            </div>

            <table {...api.getTableProps({ view: "day" })} className={styles.Table}>
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

          <div style={{ display: "flex", gap: "40px" }}>
            <div hidden={api.view !== "month"} style={{ width: "100%" }}>
              <div {...api.getViewControlProps({ view: "month" })} className={styles.ViewControl}>
                <button {...api.getPrevTriggerProps({ view: "month" })}>Prev</button>
                <button {...api.getViewTriggerProps({ view: "month" })} className={styles.ViewTrigger}>{api.visibleRange.start.year}</button>
                <button {...api.getNextTriggerProps({ view: "month" })}>Next</button>
              </div>

              <table {...api.getTableProps({ view: "month", columns: 4 })} className={styles.Table}>
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
              <div {...api.getViewControlProps({ view: "year" })} className={styles.ViewControl}>
                <button {...api.getPrevTriggerProps({ view: "year" })}>Prev</button>
                <span>
                  {api.getDecade().start} - {api.getDecade().end}
                </span>
                <button {...api.getNextTriggerProps({ view: "year" })}>Next</button>
              </div>

              <table {...api.getTableProps({ view: "year", columns: 4 })} className={styles.Table}>
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
      </div>
    </main>
  )
}
