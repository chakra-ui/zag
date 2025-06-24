import * as datePicker from "@zag-js/date-picker"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import { BiCalendar, BiChevronLeft, BiChevronRight } from "react-icons/bi"

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
      <main className="date-picker">
        <div {...api.getControlProps()}>
          <input {...api.getInputProps()} />
          <button {...api.getTriggerProps()}>
            <BiCalendar />
          </button>
        </div>

        <div {...api.getPositionerProps()}>
          <div {...api.getContentProps()}>
            <div hidden={api.view !== "day"}>
              <div {...api.getViewControlProps({ view: "year" })}>
                <button {...api.getPrevTriggerProps()}>
                  <BiChevronLeft />
                </button>
                <button {...api.getViewTriggerProps()}>
                  {api.visibleRangeText.start}
                </button>
                <button {...api.getNextTriggerProps()}>
                  <BiChevronRight />
                </button>
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
                          <div {...api.getDayTableCellTriggerProps({ value })}>
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
                <div {...api.getViewControlProps({ view: "month" })}>
                  <button {...api.getPrevTriggerProps({ view: "month" })}>
                    Prev
                  </button>
                  <button {...api.getViewTriggerProps({ view: "month" })}>
                    {api.visibleRange.start.year}
                  </button>
                  <button {...api.getNextTriggerProps({ view: "month" })}>
                    Next
                  </button>
                </div>

                <table {...api.getTableProps({ view: "month", columns: 4 })}>
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
                <div {...api.getViewControlProps({ view: "year" })}>
                  <button {...api.getPrevTriggerProps({ view: "year" })}>
                    Prev
                  </button>
                  <span>
                    {api.getDecade().start} - {api.getDecade().end}
                  </span>
                  <button {...api.getNextTriggerProps({ view: "year" })}>
                    Next
                  </button>
                </div>

                <table {...api.getTableProps({ view: "year", columns: 4 })}>
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
      </main>
    </>
  )
}
