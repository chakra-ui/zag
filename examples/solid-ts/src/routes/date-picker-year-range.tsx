import * as datePicker from "@zag-js/date-picker"
import { datePickerControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Index, createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"
import { CalendarDate, type DateValue } from "@internationalized/date"

const format = (date: DateValue) => {
  if (!date) {
    return undefined
  }
  const year = date?.year?.toString()
  return year
}

// Handle full yyyy format
const parse = (string: string) => {
  const fullRegex = /^(\d{4})$/
  const fullMatch = string.match(fullRegex)
  if (fullMatch) {
    const [_, year] = fullMatch.map(Number)
    return new CalendarDate(year, 1, 1)
  }
}

export default function Page() {
  const controls = useControls(datePickerControls)
  const service = useMachine(datePicker.machine, {
    id: createUniqueId(),
    locale: "en",
    selectionMode: "range",
    minView: "year",
    defaultView: "year",
    parse,
    format,
    placeholder: "yyyy",
  })

  const api = createMemo(() => datePicker.connect(service, normalizeProps))

  return (
    <>
      <main class="date-picker">
        <div>
          <button>Outside Element</button>
        </div>
        <p>{`Visible range: ${api().visibleRangeText.formatted}`}</p>

        <output class="date-output">
          <div>Selected: {api().valueAsString.length ? api().valueAsString : "-"}</div>
          <div>Focused: {api().focusedValueAsString}</div>
        </output>

        <div {...api().getControlProps()}>
          <input {...api().getInputProps({ index: 0 })} />
          <input {...api().getInputProps({ index: 1 })} />
          <button {...api().getClearTriggerProps()}>❌</button>
          <button {...api().getTriggerProps()}>🗓</button>
        </div>

        <div {...api().getPositionerProps()}>
          <div {...api().getContentProps()}>
            <div style={{ "margin-bottom": "20px" }}>
              <select {...api().getMonthSelectProps()}>
                <Index each={api().getMonths()}>
                  {(month, i) => (
                    <option value={i + 1} selected={api().focusedValue.month === i + 1} disabled={month().disabled}>
                      {month().label}
                    </option>
                  )}
                </Index>
              </select>

              <select {...api().getYearSelectProps()}>
                <Index each={api().getYears()}>
                  {(year) => (
                    <option
                      value={year().value}
                      selected={api().focusedValue.year === year().value}
                      disabled={year().disabled}
                    >
                      {year().label}
                    </option>
                  )}
                </Index>
              </select>
            </div>

            <div hidden={api().view !== "day"} style={{ width: "100%" }}>
              <div {...api().getViewControlProps({ view: "year" })}>
                <button {...api().getPrevTriggerProps()}>Prev</button>
                <button {...api().getViewTriggerProps()}>{api().visibleRangeText.start}</button>
                <button {...api().getNextTriggerProps()}>Next</button>
              </div>

              <table {...api().getTableProps()}>
                <thead {...api().getTableHeaderProps()}>
                  <tr>
                    <Index each={api().weekDays}>
                      {(day) => (
                        <th scope="col" aria-label={day().long}>
                          {day().narrow}
                        </th>
                      )}
                    </Index>
                  </tr>
                </thead>
                <tbody {...api().getTableBodyProps()}>
                  <Index each={api().weeks}>
                    {(week) => (
                      <tr>
                        <Index each={week()}>
                          {(value) => (
                            <td {...api().getDayTableCellProps({ value: value() })}>
                              <div {...api().getDayTableCellTriggerProps({ value: value() })}>{value().day}</div>
                            </td>
                          )}
                        </Index>
                      </tr>
                    )}
                  </Index>
                </tbody>
              </table>
            </div>

            <div style={{ display: "flex", gap: "40px", "margin-top": "24px" }}>
              <div hidden={api().view !== "month"} style={{ width: "100%" }}>
                <div {...api().getViewControlProps({ view: "year" })}>
                  <button {...api().getPrevTriggerProps({ view: "month" })}>Prev</button>
                  <button {...api().getViewTriggerProps({ view: "month" })}>{api().visibleRange.start.year}</button>
                  <button {...api().getNextTriggerProps({ view: "month" })}>Next</button>
                </div>

                <table {...api().getTableProps({ view: "month", columns: 4 })}>
                  <tbody {...api().getTableBodyProps({ view: "month" })}>
                    <Index each={api().getMonthsGrid({ columns: 4, format: "short" })}>
                      {(months) => (
                        <tr>
                          <Index each={months()}>
                            {(month) => (
                              <td {...api().getMonthTableCellProps({ ...month(), columns: 4 })}>
                                <div {...api().getMonthTableCellTriggerProps({ ...month(), columns: 4 })}>
                                  {month().label}
                                </div>
                              </td>
                            )}
                          </Index>
                        </tr>
                      )}
                    </Index>
                  </tbody>
                </table>
              </div>

              <div hidden={api().view !== "year"} style={{ width: "100%" }}>
                <div {...api().getViewControlProps({ view: "year" })}>
                  <button {...api().getPrevTriggerProps({ view: "year" })}>Prev</button>
                  <span>
                    {api().getDecade().start} - {api().getDecade().end}
                  </span>
                  <button {...api().getNextTriggerProps({ view: "year" })}>Next</button>
                </div>

                <table {...api().getTableProps({ view: "year", columns: 4 })}>
                  <tbody {...api().getTableBodyProps({ view: "year" })}>
                    <Index each={api().getYearsGrid({ columns: 4 })}>
                      {(years) => (
                        <tr>
                          <Index each={years()}>
                            {(year) => (
                              <td {...api().getYearTableCellProps({ ...year(), columns: 4 })}>
                                <div {...api().getYearTableCellTriggerProps({ ...year(), columns: 4 })}>
                                  {year().label}
                                </div>
                              </td>
                            )}
                          </Index>
                        </tr>
                      )}
                    </Index>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Toolbar viz controls={controls}>
        <StateVisualizer state={service} omit={["weeks"]} />
      </Toolbar>
    </>
  )
}
