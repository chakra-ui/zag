import { getLocalTimeZone } from "@internationalized/date"
import * as dateInput from "@zag-js/date-input"
import * as datePicker from "@zag-js/date-picker"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Index, createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/date-picker.css"

const timeZone = getLocalTimeZone()

export default function Page() {
  const datePickerService = useMachine(datePicker.machine, {
    id: createUniqueId(),
    locale: "en",
    selectionMode: "single",
    timeZone,
  })

  const datePickerApi = createMemo(() => datePicker.connect(datePickerService, normalizeProps))

  const dateInputId = createUniqueId()
  const dateInputService = useMachine(dateInput.machine, (): dateInput.Props => ({
    id: dateInputId,
    locale: "en",
    selectionMode: "single",
    timeZone,
    value: datePickerApi().value,
    onValueChange(details) {
      datePickerApi().setValue(details.value)
    },
  }))

  const dateInputApi = createMemo(() => dateInput.connect(dateInputService, normalizeProps))

  return (
    <>
      <main class="date-input date-picker">
        <output class="date-output">
          <div>Selected: {datePickerApi().valueAsString ?? "-"}</div>
        </output>

        <div {...datePickerApi().getControlProps()} style={{ display: "flex", "align-items": "center", gap: "8px" }}>
          <div {...dateInputApi().getRootProps()}>
            <label {...dateInputApi().getLabelProps()}>Date</label>
            <div {...dateInputApi().getControlProps()}>
              <div {...dateInputApi().getSegmentGroupProps()}>
                <Index each={dateInputApi().getSegments()}>
                  {(segment) => (
                    <span {...dateInputApi().getSegmentProps({ segment: segment() })}>{segment().text}</span>
                  )}
                </Index>
              </div>
            </div>
          </div>

          <button {...datePickerApi().getTriggerProps()}>📅</button>
          <button {...datePickerApi().getClearTriggerProps()}>Clear</button>
        </div>

        <div {...datePickerApi().getPositionerProps()}>
          <div {...datePickerApi().getContentProps()}>
            <div style={{ "margin-bottom": "20px" }}>
              <select {...datePickerApi().getMonthSelectProps()}>
                <Index each={datePickerApi().getMonths()}>
                  {(month) => (
                    <option value={month().value} disabled={month().disabled}>
                      {month().label}
                    </option>
                  )}
                </Index>
              </select>

              <select {...datePickerApi().getYearSelectProps()}>
                <Index each={datePickerApi().getYears()}>
                  {(year) => (
                    <option value={year().value} disabled={year().disabled}>
                      {year().label}
                    </option>
                  )}
                </Index>
              </select>
            </div>

            <div hidden={datePickerApi().view !== "day"}>
              <div {...datePickerApi().getViewControlProps({ view: "year" })}>
                <button {...datePickerApi().getPrevTriggerProps()}>Prev</button>
                <button {...datePickerApi().getViewTriggerProps()}>{datePickerApi().visibleRangeText.start}</button>
                <button {...datePickerApi().getNextTriggerProps()}>Next</button>
              </div>

              <table {...datePickerApi().getTableProps({ view: "day" })}>
                <thead {...datePickerApi().getTableHeaderProps({ view: "day" })}>
                  <tr {...datePickerApi().getTableRowProps({ view: "day" })}>
                    <Index each={datePickerApi().weekDays}>
                      {(day) => (
                        <th scope="col" aria-label={day().long}>
                          {day().narrow}
                        </th>
                      )}
                    </Index>
                  </tr>
                </thead>
                <tbody {...datePickerApi().getTableBodyProps({ view: "day" })}>
                  <Index each={datePickerApi().weeks}>
                    {(week) => (
                      <tr {...datePickerApi().getTableRowProps({ view: "day" })}>
                        <Index each={week()}>
                          {(value) => (
                            <td {...datePickerApi().getDayTableCellProps({ value: value() })}>
                              <div {...datePickerApi().getDayTableCellTriggerProps({ value: value() })}>
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

      <Toolbar viz>
        <StateVisualizer state={datePickerService} omit={["weeks"]} />
      </Toolbar>
    </>
  )
}
