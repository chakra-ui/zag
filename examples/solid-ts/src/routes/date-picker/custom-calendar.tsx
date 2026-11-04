import { PersianCalendar } from "@internationalized/date"
import * as datePicker from "@zag-js/date-picker"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { For, createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/date-picker.css"

// Only bundle the Persian calendar — not all 13+ calendars.
function createCalendar(identifier: string) {
  switch (identifier) {
    case "persian":
      return new PersianCalendar()
    default:
      throw new Error(`Unsupported calendar: ${identifier}`)
  }
}

export default function Page() {
  const service = useMachine(datePicker.machine, {
    id: createUniqueId(),
    locale: "fa-IR",
    createCalendar,
    selectionMode: "single",
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
            <div style={{ "margin-bottom": "20px" }}>
              <select {...api().getMonthSelectProps()}>
                <For keyed={false} each={api().getMonths()}>
                  {(month) => (
                    <option value={month().value} disabled={month().disabled}>
                      {month().label}
                    </option>
                  )}
                </For>
              </select>

              <select {...api().getYearSelectProps()}>
                <For keyed={false} each={api().getYears()}>
                  {(year) => (
                    <option value={year().value} disabled={year().disabled}>
                      {year().label}
                    </option>
                  )}
                </For>
              </select>
            </div>

            <div hidden={api().view !== "day"}>
              <div {...api().getViewControlProps({ view: "year" })}>
                <button {...api().getPreviousTriggerProps()}>Prev</button>
                <button {...api().getViewTriggerProps()}>{api().visibleRangeText.start}</button>
                <button {...api().getNextTriggerProps()}>Next</button>
              </div>

              <table {...api().getTableProps({ view: "day" })}>
                <thead {...api().getTableHeaderProps({ view: "day" })}>
                  <tr {...api().getTableRowProps({ view: "day" })}>
                    <For keyed={false} each={api().weekDays}>
                      {(day) => (
                        <th scope="col" aria-label={day().long}>
                          {day().narrow}
                        </th>
                      )}
                    </For>
                  </tr>
                </thead>
                <tbody {...api().getTableBodyProps({ view: "day" })}>
                  <For keyed={false} each={api().weeks}>
                    {(week) => (
                      <tr {...api().getTableRowProps({ view: "day" })}>
                        <For keyed={false} each={week()}>
                          {(value) => (
                            <td {...api().getDayTableCellProps({ value: value() })}>
                              <div {...api().getDayTableCellTriggerProps({ value: value() })}>{value().day}</div>
                            </td>
                          )}
                        </For>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>

            <div style={{ display: "flex", gap: "40px" }}>
              <div hidden={api().view !== "month"} style={{ width: "100%" }}>
                <div {...api().getViewControlProps({ view: "month" })}>
                  <button {...api().getPreviousTriggerProps({ view: "month" })}>Prev</button>
                  <button {...api().getViewTriggerProps({ view: "month" })}>{api().visibleRange.start.year}</button>
                  <button {...api().getNextTriggerProps({ view: "month" })}>Next</button>
                </div>

                <table {...api().getTableProps({ view: "month", columns: 4 })}>
                  <tbody {...api().getTableBodyProps({ view: "month" })}>
                    <For keyed={false} each={api().getMonthsGrid({ columns: 4, format: "short" })}>
                      {(months) => (
                        <tr {...api().getTableRowProps()}>
                          <For keyed={false} each={months()}>
                            {(month) => (
                              <td {...api().getMonthTableCellProps({ ...month(), columns: 4 })}>
                                <div {...api().getMonthTableCellTriggerProps({ ...month(), columns: 4 })}>
                                  {month().label}
                                </div>
                              </td>
                            )}
                          </For>
                        </tr>
                      )}
                    </For>
                  </tbody>
                </table>
              </div>

              <div hidden={api().view !== "year"} style={{ width: "100%" }}>
                <div {...api().getViewControlProps({ view: "year" })}>
                  <button {...api().getPreviousTriggerProps({ view: "year" })}>Prev</button>
                  <span>
                    {api().getDecade().start} - {api().getDecade().end}
                  </span>
                  <button {...api().getNextTriggerProps({ view: "year" })}>Next</button>
                </div>

                <table {...api().getTableProps({ view: "year", columns: 4 })}>
                  <tbody {...api().getTableBodyProps()}>
                    <For keyed={false} each={api().getYearsGrid({ columns: 4 })}>
                      {(years) => (
                        <tr {...api().getTableRowProps({ view: "year" })}>
                          <For keyed={false} each={years()}>
                            {(year) => (
                              <td {...api().getYearTableCellProps({ ...year(), columns: 4 })}>
                                <div {...api().getYearTableCellTriggerProps({ ...year(), columns: 4 })}>
                                  {year().label}
                                </div>
                              </td>
                            )}
                          </For>
                        </tr>
                      )}
                    </For>
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
