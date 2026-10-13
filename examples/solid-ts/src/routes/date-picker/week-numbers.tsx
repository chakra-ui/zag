import * as datePicker from "@zag-js/date-picker"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Index, Show, createMemo, createUniqueId } from "solid-js"
import "@styles/date-picker.css"

export default function Page() {
  const service = useMachine(datePicker.machine, {
    id: createUniqueId(),
    locale: "en",
    selectionMode: "single",
    inline: true,
    showWeekNumbers: true,
  })

  const api = createMemo(() => datePicker.connect(service, normalizeProps))

  return (
    <main class="date-picker">
      <output class="date-output">
        <div>Selected: {api().valueAsString ?? "-"}</div>
        <div>Focused: {api().focusedValueAsString}</div>
      </output>

      <div {...api().getRootProps()}>
        <div {...api().getContentProps()}>
          <div style={{ "margin-bottom": "20px" }}>
            <select {...api().getMonthSelectProps()}>
              <Index each={api().getMonths()}>
                {(month) => (
                  <option value={month().value} disabled={month().disabled}>
                    {month().label}
                  </option>
                )}
              </Index>
            </select>

            <select {...api().getYearSelectProps()}>
              <Index each={api().getYears()}>
                {(year) => (
                  <option value={year().value} disabled={year().disabled}>
                    {year().label}
                  </option>
                )}
              </Index>
            </select>
          </div>

          <div hidden={api().view !== "day"}>
            <div {...api().getViewControlProps({ view: "day" })}>
              <button {...api().getPrevTriggerProps()}>Prev</button>
              <button {...api().getViewTriggerProps()}>{api().visibleRangeText.start}</button>
              <button {...api().getNextTriggerProps()}>Next</button>
            </div>

            <table {...api().getTableProps({ view: "day" })}>
              <thead {...api().getTableHeaderProps({ view: "day" })}>
                <tr {...api().getTableRowProps({ view: "day" })}>
                  <Show when={api().showWeekNumbers}>
                    <th {...api().getWeekNumberHeaderCellProps({ view: "day" })}>Wk</th>
                  </Show>
                  <Index each={api().weekDays}>
                    {(day) => (
                      <th scope="col" aria-label={day().long}>
                        {day().narrow}
                      </th>
                    )}
                  </Index>
                </tr>
              </thead>
              <tbody {...api().getTableBodyProps({ view: "day" })}>
                <Index each={api().weeks}>
                  {(week, weekIndex) => (
                    <tr {...api().getTableRowProps({ view: "day" })}>
                      <Show when={api().showWeekNumbers}>
                        <td {...api().getWeekNumberCellProps({ weekIndex, week: week() })}>
                          {api().getWeekNumber(week())}
                        </td>
                      </Show>
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

          <div style={{ display: "flex", gap: "40px" }}>
            <div hidden={api().view !== "month"} style={{ width: "100%" }}>
              <div {...api().getViewControlProps({ view: "month" })}>
                <button {...api().getPrevTriggerProps({ view: "month" })}>Prev</button>
                <button {...api().getViewTriggerProps({ view: "month" })}>{api().visibleRange.start.year}</button>
                <button {...api().getNextTriggerProps({ view: "month" })}>Next</button>
              </div>

              <table {...api().getTableProps({ view: "month", columns: 4 })}>
                <tbody {...api().getTableBodyProps({ view: "month" })}>
                  <Index each={api().getMonthsGrid({ columns: 4, format: "short" })}>
                    {(months) => (
                      <tr {...api().getTableRowProps()}>
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
                <tbody {...api().getTableBodyProps()}>
                  <Index each={api().getYearsGrid({ columns: 4 })}>
                    {(years) => (
                      <tr {...api().getTableRowProps({ view: "year" })}>
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
  )
}
