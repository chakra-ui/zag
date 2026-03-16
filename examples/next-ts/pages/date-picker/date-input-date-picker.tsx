import { getLocalTimeZone } from "@internationalized/date"
import * as dateInput from "@zag-js/date-input"
import * as datePicker from "@zag-js/date-picker"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

const timeZone = getLocalTimeZone()

export default function Page() {
  const datePickerService = useMachine(datePicker.machine, {
    id: useId(),
    locale: "en",
    selectionMode: "single",
    timeZone,
  })

  const datePickerApi = datePicker.connect(datePickerService, normalizeProps)
  const pickerValue = datePickerApi.value

  const dateInputService = useMachine(dateInput.machine, {
    id: useId(),
    locale: "en",
    selectionMode: "single",
    timeZone,
    value: pickerValue,
    onValueChange(details) {
      datePickerApi.setValue(details.value)
    },
  })

  const dateInputApi = dateInput.connect(dateInputService, normalizeProps)

  return (
    <>
      <main className="date-input date-picker">
        <output className="date-output">
          <div>Selected: {datePickerApi.valueAsString ?? "-"}</div>
        </output>

        <div {...datePickerApi.getControlProps()} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div {...dateInputApi.getRootProps()}>
            <label {...dateInputApi.getLabelProps()}>Date</label>
            <div {...dateInputApi.getControlProps()}>
              <div {...dateInputApi.getSegmentGroupProps()}>
                {dateInputApi.getSegments().map((segment, i) => (
                  <span key={i} {...dateInputApi.getSegmentProps({ segment })}>
                    {segment.text}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button {...datePickerApi.getTriggerProps()}>📅</button>
          <button {...datePickerApi.getClearTriggerProps()}>Clear</button>
        </div>

        <div {...datePickerApi.getPositionerProps()}>
          <div {...datePickerApi.getContentProps()}>
            <div style={{ marginBottom: "20px" }}>
              <select {...datePickerApi.getMonthSelectProps()}>
                {datePickerApi.getMonths().map((month, i) => (
                  <option key={i} value={month.value} disabled={month.disabled}>
                    {month.label}
                  </option>
                ))}
              </select>

              <select {...datePickerApi.getYearSelectProps()}>
                {datePickerApi.getYears().map((year, i) => (
                  <option key={i} value={year.value} disabled={year.disabled}>
                    {year.label}
                  </option>
                ))}
              </select>
            </div>

            <div hidden={datePickerApi.view !== "day"}>
              <div {...datePickerApi.getViewControlProps({ view: "year" })}>
                <button {...datePickerApi.getPrevTriggerProps()}>Prev</button>
                <button {...datePickerApi.getViewTriggerProps()}>{datePickerApi.visibleRangeText.start}</button>
                <button {...datePickerApi.getNextTriggerProps()}>Next</button>
              </div>

              <table {...datePickerApi.getTableProps({ view: "day" })}>
                <thead {...datePickerApi.getTableHeaderProps({ view: "day" })}>
                  <tr {...datePickerApi.getTableRowProps({ view: "day" })}>
                    {datePickerApi.weekDays.map((day, i) => (
                      <th scope="col" key={i} aria-label={day.long}>
                        {day.narrow}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody {...datePickerApi.getTableBodyProps({ view: "day" })}>
                  {datePickerApi.weeks.map((week, i) => (
                    <tr key={i} {...datePickerApi.getTableRowProps({ view: "day" })}>
                      {week.map((value, i) => (
                        <td key={i} {...datePickerApi.getDayTableCellProps({ value })}>
                          <div {...datePickerApi.getDayTableCellTriggerProps({ value })}>{value.day}</div>
                        </td>
                      ))}
                    </tr>
                  ))}
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
