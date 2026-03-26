import styles from "../../../../shared/src/css/date-picker.module.css"
import { CalendarDate, DateValue } from "@internationalized/date"
import * as datePicker from "@zag-js/date-picker"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

const format = (date: DateValue) => {
  const month = date.month.toString().padStart(2, "0")
  const year = date.year.toString()
  return `${month}/${year}`
}

const parse = (string: string) => {
  // Handle full mm/yyyy format
  const fullRegex = /^(\d{1,2})\/(\d{4})$/
  const fullMatch = string.match(fullRegex)
  if (fullMatch) {
    const [_, month, year] = fullMatch.map(Number)
    return new CalendarDate(year, month, 1)
  }

  return undefined
}

export default function Page() {
  const service = useMachine(datePicker.machine, {
    id: useId(),
    locale: "en",
    view: "month",
    minView: "month",
    placeholder: "mm/yyyy",
    format,
    parse,
  })

  const api = datePicker.connect(service, normalizeProps)

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

        <div {...api.getControlProps()} className={styles.Control}>
          <input {...api.getInputProps()} />
          <button {...api.getClearTriggerProps()}>❌</button>
          <button {...api.getTriggerProps()} className={styles.Trigger}>🗓</button>
        </div>

        <div {...api.getPositionerProps()}>
          <div {...api.getContentProps()} className={styles.Content}>
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

      <Toolbar viz>
        <StateVisualizer state={service} omit={["weeks"]} />
      </Toolbar>
    </>
  )
}
