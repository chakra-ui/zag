import * as datePicker from "@zag-js/date-picker"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Index, createMemo, createUniqueId } from "solid-js"
import "@styles/date-picker.css"

export default function Page() {
  const service = useMachine(datePicker.machine, {
    id: createUniqueId(),
    locale: "en",
    selectionMode: "single",
    numOfMonths: 2,
  })

  const api = createMemo(() => datePicker.connect(service, normalizeProps))
  const offset = createMemo(() => api().getOffset({ months: 1 }))

  return (
    <main class="date-picker">
      <div>
        <button>Outside Element</button>
      </div>
      <p>{`Visible range: ${api().visibleRangeText.formatted}`}</p>

      <output class="date-output">
        <div>Selected: {api().valueAsString ?? "-"}</div>
        <div>Focused: {api().focusedValueAsString}</div>
      </output>

      <div {...api().getControlProps()}>
        <input {...api().getInputProps()} />
        <button {...api().getClearTriggerProps()}>❌</button>
        <button {...api().getTriggerProps()}>🗓</button>
      </div>

      <div {...api().getPositionerProps()}>
        <div {...api().getContentProps()}>
          <div style={{ display: "flex", gap: "10px" }}>
            <button {...api().getPreviousTriggerProps()}>Prev</button>
            <button {...api().getNextTriggerProps()}>Next</button>
          </div>

          <hr />

          <div>{api().visibleRangeText.start}</div>

          <table {...api().getTableProps({ view: "day" })}>
            <thead {...api().getTableHeaderProps({ view: "day" })}>
              <tr {...api().getTableRowProps({ view: "day" })}>
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
                {(week) => (
                  <tr {...api().getTableRowProps({ view: "day" })}>
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

          <hr />

          <div>{offset().visibleRangeText.start}</div>

          <table {...api().getTableProps({ view: "day" })}>
            <thead {...api().getTableHeaderProps()}>
              <tr {...api().getTableRowProps()}>
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
              <Index each={offset().weeks}>
                {(week) => (
                  <tr {...api().getTableRowProps({ view: "day" })}>
                    <Index each={week()}>
                      {(value) => (
                        <td {...api().getDayTableCellProps({ value: value(), visibleRange: offset().visibleRange })}>
                          <div
                            {...api().getDayTableCellTriggerProps({
                              value: value(),
                              visibleRange: offset().visibleRange,
                            })}
                          >
                            {value().day}
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

        <div style={{ display: "flex", gap: "40px" }}>
          <div {...api().getViewProps({ view: "month" })}>
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

          <div {...api().getViewProps({ view: "year" })}>
            <table {...api().getTableProps({ view: "year", columns: 4 })}>
              <tbody {...api().getTableBodyProps()}>
                <Index each={api().getYearsGrid({ columns: 4 })}>
                  {(years) => (
                    <tr {...api().getTableRowProps({ view: "year" })}>
                      <Index each={years()}>
                        {(year) => (
                          <td {...api().getYearTableCellProps({ ...year(), columns: 4 })}>
                            <div {...api().getYearTableCellTriggerProps({ ...year(), columns: 4 })}>{year().label}</div>
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
    </main>
  )
}
