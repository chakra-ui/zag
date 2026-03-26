import * as datePicker from "@zag-js/date-picker"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

interface Props extends Omit<datePicker.Props, "id"> {}

export function DateRangePicker(props: Props) {
  const { value, defaultValue, open, ...contextProps } = props

  const service = useMachine(datePicker.machine, {
    id: useId(),
    value,
    defaultValue,
    open,
    locale: "en",
    numOfMonths: 2,
    ...contextProps,
    selectionMode: "range",
  })

  const api = datePicker.connect(service, normalizeProps)

  const offset = api.getOffset({ months: 1 })

  return (
    <main className="date-picker">
      <p>{`Visible range: ${api.visibleRangeText.formatted}`}</p>

      <output className="date-output">
        <div>Selected: {api.valueAsString ?? "-"}</div>
        <div>Focused: {api.focusedValueAsString}</div>
      </output>

      <div {...api.getControlProps()}>
        <input {...api.getInputProps({ index: 0 })} />
        <input {...api.getInputProps({ index: 1 })} />
        <button {...api.getClearTriggerProps()}>❌</button>
        <button {...api.getTriggerProps()}>🗓</button>
      </div>

      <div>
        <div {...api.getContentProps()}>
          <div style={{ marginBottom: "20px" }}>
            <select {...api.getMonthSelectProps()}>
              {api.getMonths().map((month, i) => (
                <option key={i} value={i + 1} disabled={month.disabled}>
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

          <div>
            <div {...api.getViewControlProps({ view: "year" })}>
              <button {...api.getPrevTriggerProps()}>Prev</button>

              <span>
                {api.visibleRangeText.start} - {api.visibleRangeText.end}
              </span>

              <button {...api.getNextTriggerProps()}>Next</button>
            </div>

            <div style={{ display: "flex", gap: "24px" }}>
              <table {...api.getTableProps({ id: "r1" })}>
                <thead {...api.getTableHeaderProps()}>
                  <tr {...api.getTableRowProps()}>
                    {api.weekDays.map((day, i) => (
                      <th scope="col" key={i} aria-label={day.long}>
                        {day.narrow}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody {...api.getTableBodyProps()}>
                  {api.weeks.map((week, i) => (
                    <tr key={i} {...api.getTableRowProps()}>
                      {week.map((value, i) => (
                        <td key={i} {...api.getDayTableCellProps({ value })}>
                          <div {...api.getDayTableCellTriggerProps({ value })}>{value.day}</div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              <table {...api.getTableProps({ id: "r2" })}>
                <thead {...api.getTableHeaderProps()}>
                  <tr {...api.getTableRowProps()}>
                    {api.weekDays.map((day, i) => (
                      <th scope="col" key={i} aria-label={day.long}>
                        {day.narrow}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody {...api.getTableBodyProps()}>
                  {offset.weeks.map((week, i) => (
                    <tr key={i} {...api.getTableRowProps()}>
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
          </div>
        </div>
      </div>
    </main>
  )
}
