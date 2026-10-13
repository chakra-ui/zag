import * as datePicker from "@zag-js/date-picker"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Index, createMemo, createSignal, createUniqueId } from "solid-js"
import "@styles/date-picker.css"

export default function Page() {
  const [open, setOpen] = createSignal(false)

  const id = createUniqueId()
  const service = useMachine(datePicker.machine, (): datePicker.Props => ({
    id,
    locale: "en",
    numOfMonths: 2,
    selectionMode: "range",
    open: open(),
    onOpenChange: (details) => setOpen(details.open),
  }))

  const api = createMemo(() => datePicker.connect(service, normalizeProps))

  const offset = createMemo(() => api().getOffset({ months: 1 }))

  return (
    <div style={{ padding: "40px", height: "200vh" }}>
      <h1>DateRange Picker Controlled</h1>
      <h1>{String(open())}</h1>

      <div style={{ display: "flex", gap: "12px", "margin-bottom": "24px" }}>
        <button type="button" onClick={() => setOpen(true)}>
          Open
        </button>
        <button type="button" onClick={() => setOpen(false)}>
          Close
        </button>
      </div>

      <main class="date-picker">
        <p>{`Visible range: ${api().visibleRangeText.formatted}`}</p>

        <output class="date-output">
          <div>Selected: {api().valueAsString ?? "-"}</div>
          <div>Focused: {api().focusedValueAsString}</div>
        </output>

        <div {...api().getControlProps()}>
          <input {...api().getInputProps({ index: 0 })} />
          <input {...api().getInputProps({ index: 1 })} />
          <button {...api().getClearTriggerProps()}>❌</button>
          <button {...api().getTriggerProps()}>🗓</button>
        </div>

        <div {...api().getContentProps()}>
          <div style={{ "margin-bottom": "20px" }}>
            <select {...api().getMonthSelectProps()}>
              <Index each={api().getMonths()}>
                {(month, i) => (
                  <option value={i + 1} disabled={month().disabled}>
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

          <div>
            <div {...api().getViewControlProps({ view: "year" })}>
              <button {...api().getPrevTriggerProps()}>Prev</button>
              <span>
                {api().visibleRangeText.start} - {api().visibleRangeText.end}
              </span>
              <button {...api().getNextTriggerProps()}>Next</button>
            </div>

            <div style={{ display: "flex", gap: "24px" }}>
              <table {...api().getTableProps({ id: "r1" })}>
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
                <tbody {...api().getTableBodyProps()}>
                  <Index each={api().weeks}>
                    {(week) => (
                      <tr {...api().getTableRowProps()}>
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

              <table {...api().getTableProps({ id: "r2" })}>
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
                <tbody {...api().getTableBodyProps()}>
                  <Index each={offset().weeks}>
                    {(week) => (
                      <tr {...api().getTableRowProps()}>
                        <Index each={week()}>
                          {(value) => (
                            <td
                              {...api().getDayTableCellProps({ value: value(), visibleRange: offset().visibleRange })}
                            >
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
          </div>
        </div>
      </main>
    </div>
  )
}
