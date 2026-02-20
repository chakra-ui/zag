import * as datePicker from "@zag-js/date-picker"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import { BiCalendar, BiChevronLeft, BiChevronRight } from "react-icons/bi"
import styles from "../styles/machines/date-picker.module.css"

interface DatePickerProps extends Omit<datePicker.Props, "id"> {}

export function DatePicker(props: DatePickerProps) {
  const service = useMachine(datePicker.machine, {
    id: useId(),
    locale: "en-US",
    selectionMode: "single",
    ...props,
  })

  const api = datePicker.connect(service, normalizeProps)

  return (
    <>
      <div className={styles.Control} {...api.getControlProps()}>
        <input className={styles.Input} {...api.getInputProps()} />
        <button className={styles.Trigger} {...api.getTriggerProps()}>
          <BiCalendar />
        </button>
      </div>

      <div {...api.getPositionerProps()}>
        <div className={styles.Content} {...api.getContentProps()}>
          <div hidden={api.view !== "day"}>
            <div
              className={styles.ViewControl}
              {...api.getViewControlProps({ view: "year" })}
            >
              <button
                className={styles.PrevTrigger}
                {...api.getPrevTriggerProps()}
              >
                <BiChevronLeft />
              </button>
              <button
                className={styles.ViewTrigger}
                {...api.getViewTriggerProps()}
              >
                {api.visibleRangeText.start}
              </button>
              <button
                className={styles.NextTrigger}
                {...api.getNextTriggerProps()}
              >
                <BiChevronRight />
              </button>
            </div>

            <table
              className={styles.Table}
              {...api.getTableProps({ view: "day" })}
            >
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
                        <div
                          className={styles.TableCellTrigger}
                          {...api.getDayTableCellTriggerProps({ value })}
                        >
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
            <div hidden={api.view !== "month"} style={{ width: "100%" }}>
              <div
                className={styles.ViewControl}
                {...api.getViewControlProps({ view: "month" })}
              >
                <button
                  className={styles.PrevTrigger}
                  {...api.getPrevTriggerProps({ view: "month" })}
                >
                  Prev
                </button>
                <button
                  className={styles.ViewTrigger}
                  {...api.getViewTriggerProps({ view: "month" })}
                >
                  {api.visibleRange.start.year}
                </button>
                <button
                  className={styles.NextTrigger}
                  {...api.getNextTriggerProps({ view: "month" })}
                >
                  Next
                </button>
              </div>

              <table
                className={styles.Table}
                {...api.getTableProps({ view: "month", columns: 4 })}
              >
                <tbody {...api.getTableBodyProps({ view: "month" })}>
                  {api
                    .getMonthsGrid({ columns: 4, format: "short" })
                    .map((months, row) => (
                      <tr key={row} {...api.getTableRowProps()}>
                        {months.map((month, index) => (
                          <td
                            key={index}
                            {...api.getMonthTableCellProps({
                              ...month,
                              columns: 4,
                            })}
                          >
                            <div
                              className={styles.TableCellTrigger}
                              {...api.getMonthTableCellTriggerProps({
                                ...month,
                                columns: 4,
                              })}
                            >
                              {month.label}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div hidden={api.view !== "year"} style={{ width: "100%" }}>
              <div
                className={styles.ViewControl}
                {...api.getViewControlProps({ view: "year" })}
              >
                <button
                  className={styles.PrevTrigger}
                  {...api.getPrevTriggerProps({ view: "year" })}
                >
                  Prev
                </button>
                <span>
                  {api.getDecade().start} - {api.getDecade().end}
                </span>
                <button
                  className={styles.NextTrigger}
                  {...api.getNextTriggerProps({ view: "year" })}
                >
                  Next
                </button>
              </div>

              <table
                className={styles.Table}
                {...api.getTableProps({ view: "year", columns: 4 })}
              >
                <tbody {...api.getTableBodyProps()}>
                  {api.getYearsGrid({ columns: 4 }).map((years, row) => (
                    <tr key={row} {...api.getTableRowProps({ view: "year" })}>
                      {years.map((year, index) => (
                        <td
                          key={index}
                          {...api.getYearTableCellProps({
                            ...year,
                            columns: 4,
                          })}
                        >
                          <div
                            className={styles.TableCellTrigger}
                            {...api.getYearTableCellTriggerProps({
                              ...year,
                              columns: 4,
                            })}
                          >
                            {year.label}
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
    </>
  )
}
