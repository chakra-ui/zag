import { CalendarDate } from "@internationalized/date"
import * as datePicker from "@zag-js/date-picker"
import { getYearsRange } from "@zag-js/date-utils"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, defineComponent, h, Fragment } from "vue"
import { datePickerControls } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default defineComponent({
  name: "datePicker",
  setup() {
    const controls = useControls(datePickerControls)

    const [state, send] = useMachine(
      datePicker.machine({
        id: "1",
        locale: "en",
        selectionMode: "single",
        max: new CalendarDate(2023, 4, 20),
        min: new CalendarDate(2010, 1, 20),
      }),
      {
        context: controls.context,
      },
    )

    const apiRef = computed(() => datePicker.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <main class="date-picker">
            <div>
              <button>Outside Element</button>
            </div>
            <p>{`Visible range: ${api.visibleRangeText.formatted}`}</p>

            <output class="date-output">
              <div>Selected: {api.valueAsString ?? "-"}</div>
              <div>Focused: {api.focusedValueAsString}</div>
            </output>

            <div {...api.controlProps}>
              <input {...api.inputProps} />
              <button {...api.clearTriggerProps}>❌</button>
              <button {...api.triggerProps}>🗓</button>
            </div>

            <div {...api.positionerProps}>
              <div {...api.contentProps}>
                <div style={{ marginBottom: "20px" }}>
                  <select {...api.monthSelectProps}>
                    {api.getMonths().map((month, i) => (
                      <option key={i} value={i + 1} selected={api.focusedValue.month === i + 1}>
                        {month}
                      </option>
                    ))}
                  </select>

                  <select {...api.yearSelectProps}>
                    {getYearsRange({ from: 1_000, to: 4_000 }).map((year, i) => (
                      <option key={i} value={year} selected={api.focusedValue.year === year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div hidden={api.view !== "day"} style={{ width: "100%" }}>
                  <div {...api.getViewControlProps()}>
                    <button {...api.getPrevTriggerProps()}>Prev</button>
                    <button {...api.getViewTriggerProps()}>{api.visibleRangeText.start}</button>
                    <button {...api.getNextTriggerProps()}>Next</button>
                  </div>

                  <table {...api.getTableProps()}>
                    <thead {...api.getTableHeaderProps()}>
                      <tr>
                        {api.weekDays.map((day, i) => (
                          <th scope="col" key={i} aria-label={day.long}>
                            {day.narrow}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {api.weeks.map((week, i) => (
                        <tr key={i}>
                          {week.map((value, i) => (
                            <td key={i} {...api.getDayTableCellProps({ value })}>
                              <div {...api.getDayTableCellTriggerProps({ value })}>{value.day}</div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: "flex", gap: "40px", marginTop: "24px" }}>
                  <div hidden={api.view !== "month"} style={{ width: "100%" }}>
                    <div {...api.getViewControlProps({ view: "month" })}>
                      <button {...api.getPrevTriggerProps({ view: "month" })}>Prev</button>
                      <span {...api.getViewTriggerProps({ view: "month" })}>{api.visibleRange.start.year}</span>
                      <button {...api.getNextTriggerProps({ view: "month" })}>Next</button>
                    </div>

                    <table {...api.getTableProps({ view: "month", columns: 4 })}>
                      <tbody>
                        {api.getMonthsGrid({ columns: 4, format: "short" }).map((months, row) => (
                          <tr key={row}>
                            {months.map((month, index) => (
                              <td key={index} {...api.getMonthTableCellProps({ ...month, columns: 4 })}>
                                <div {...api.getMonthTableCellTriggerProps({ ...month, columns: 4 })}>{month}</div>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div hidden={api.view !== "year"} style={{ width: "100%" }}>
                    <div {...api.getViewControlProps({ view: "year" })}>
                      <button {...api.getPrevTriggerProps({ view: "year" })}>Prev</button>
                      <span>
                        {api.getDecade().start} - {api.getDecade().end}
                      </span>
                      <button {...api.getNextTriggerProps({ view: "year" })}>Next</button>
                    </div>

                    <table {...api.getTableProps({ view: "year", columns: 4 })}>
                      <tbody>
                        {api.getYearsGrid({ columns: 4 }).map((years, row) => (
                          <tr key={row} {...api.getTableRowProps({ view: "year" })}>
                            {years.map((year, index) => (
                              <td key={index} {...api.getYearTableCellProps({ ...year, columns: 4 })}>
                                <div {...api.getYearTableCellTriggerProps({ ...year, columns: 4 })}>{year}</div>
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

          <Toolbar viz controls={controls.ui}>
            <StateVisualizer state={state} omit={["weeks"]} />
          </Toolbar>
        </>
      )
    }
  },
})
