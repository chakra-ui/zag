import * as datePicker from "@zag-js/date-picker"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Index, createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/date-picker.css"

const pad = (value: number) => String(value).padStart(2, "0")

export default function Page() {
  const service = useMachine(datePicker.machine, {
    id: createUniqueId(),
    locale: "en",
    selectionMode: "single",
    closeOnSelect: false,
  })

  const api = createMemo(() => datePicker.connect(service, normalizeProps))

  const value = createMemo(() => api().value[0])
  const time = createMemo(() => {
    const v = value()
    return v && "hour" in v ? v : undefined
  })
  const timeValue = createMemo(() => {
    const t = time()
    return t ? `${pad(t.hour)}:${pad(t.minute)}` : "12:00"
  })

  const handleTimeChange = (e: Event & { currentTarget: HTMLInputElement }) => {
    const [hours, minutes] = e.currentTarget.value.split(":").map(Number)
    if (!isNaN(hours) && !isNaN(minutes)) {
      api().setTime({ hour: hours, minute: minutes, second: 0 })
    }
  }

  const dateTimeString = createMemo(() => {
    const v = value()
    if (!v) return undefined
    const t = time()
    const date = `${v.year}-${pad(v.month)}-${pad(v.day)}`
    return t ? `${date} ${pad(t.hour)}:${pad(t.minute)}` : date
  })

  return (
    <>
      <main class="date-picker">
        <div>
          <h2>Date-Time Picker Example</h2>
          <p>Combines Zag date picker with native time input using the new setTime API</p>
        </div>

        <output class="date-output">
          <div>Selected DateTime: {dateTimeString() ?? "-"}</div>
          <div>Has Time: {time() ? "Yes" : "No"}</div>
        </output>

        <div
          {...api().getControlProps()}
          style={{ display: "flex", gap: "8px", "align-items": "center", "margin-bottom": "16px" }}
        >
          <button {...api().getTriggerProps()}>{dateTimeString() ?? "Select Date & Time"}</button>
          <button {...api().getClearTriggerProps()}>Clear</button>
        </div>

        <div {...api().getPositionerProps()}>
          <div {...api().getContentProps()}>
            <div hidden={api().view !== "day"}>
              <div {...api().getViewControlProps({ view: "year" })}>
                <button {...api().getPreviousTriggerProps()}>Prev</button>
                <button {...api().getViewTriggerProps()}>{api().visibleRangeText.start}</button>
                <button {...api().getNextTriggerProps()}>Next</button>
              </div>

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

              <div
                style={{
                  "border-top": "1px solid #e2e8f0",
                  "margin-top": "12px",
                  "padding-top": "12px",
                  display: "flex",
                  "align-items": "center",
                  gap: "8px",
                }}
              >
                <label style={{ "font-size": "14px", "font-weight": 500 }}>Time:</label>
                <input
                  type="time"
                  value={timeValue()}
                  onInput={handleTimeChange}
                  disabled={!value()}
                  style={{
                    padding: "6px 8px",
                    "font-size": "14px",
                    border: "1px solid #e2e8f0",
                    "border-radius": "4px",
                    flex: 1,
                  }}
                />
              </div>
            </div>

            <div hidden={api().view !== "month"} style={{ width: "100%" }}>
              <div {...api().getViewControlProps({ view: "month" })}>
                <button {...api().getPreviousTriggerProps({ view: "month" })}>Prev</button>
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
                <button {...api().getPreviousTriggerProps({ view: "year" })}>Prev</button>
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
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} omit={["weeks"]} />
      </Toolbar>
    </>
  )
}
