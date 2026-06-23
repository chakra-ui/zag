import { datePickerControls } from "@zag-js/shared"
import { defineHandler } from "nitro/h3"
import { Controls } from "../../components/controls"
import { Head } from "../../components/head"
import { Nav } from "../../components/nav"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/date-picker.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data="datePicker"
          x-date-picker="{
            id: $id('date-picker'),
            locale: 'en',
            selectionMode: 'single',
            ...context
          }"
        >
          <Nav currentComponent={event.context.currentComponent as string} />

          <main class="date-picker">
            <div>
              <button>Outside Element</button>
            </div>
            <p x-text="'Visible range: ' + $datePicker().visibleRangeText.formatted"></p>

            <output class="date-output">
              <div x-text="'Selected: ' + ($datePicker().valueAsString ?? '-')"></div>
              <div x-text="'Focused: ' + $datePicker().focusedValueAsString"></div>
            </output>

            <div x-date-picker:control>
              <input x-date-picker:input />
              <button x-date-picker:clear-trigger>❌</button>
              <button x-date-picker:trigger>🗓</button>
            </div>

            <div x-date-picker:positioner>
              <div x-date-picker:content>
                <div style={{ marginBottom: "20px" }}>
                  <select x-date-picker:month-select>
                    <template x-for="month in $datePicker().getMonths()" x-bind:key="month.value">
                      <option x-bind:value="month.value" x-bind:disabled="month.disabled" x-text="month.label"></option>
                    </template>
                  </select>

                  <select x-date-picker:year-select>
                    <template x-for="(year, i) in $datePicker().getYears()" x-bind:key="year.value">
                      <option x-bind:value="year.value" x-bind:disabled="year.disabled" x-text="year.label"></option>
                    </template>
                  </select>
                </div>

                <div x-bind:hidden="$datePicker().view !== 'day'">
                  <div x-date-picker:view-control="{view: 'year'}">
                    <button x-date-picker:prev-trigger>Prev</button>
                    <button x-date-picker:view-trigger x-text="$datePicker().visibleRangeText.start"></button>
                    <button x-date-picker:next-trigger>Next</button>
                  </div>

                  <table x-date-picker:table="{view: 'day'}">
                    <thead x-date-picker:table-header="{view: 'day'}">
                      <tr x-date-picker:table-row="{view: 'day'}">
                        <template x-for="day in $datePicker().weekDays" x-bind:key="day.long">
                          <th scope="col" x-bind:aria-label="day.long" x-text="day.narrow"></th>
                        </template>
                      </tr>
                    </thead>
                    <tbody x-date-picker:table-body="{view: 'day'}">
                      <template x-for="week in $datePicker().weeks" x-bind:key="week.at(0).toString()">
                        <tr x-date-picker:table-row="{view: 'day'}">
                          <template x-for="value in week" x-bind:key="value.day">
                            <td x-date-picker:day-table-cell="{ value }">
                              <div x-date-picker:day-table-cell-trigger="{ value }" x-text="value.day"></div>
                            </td>
                          </template>
                        </tr>
                      </template>
                    </tbody>
                  </table>
                </div>

                <div style={{ display: "flex", gap: "40px" }}>
                  <div x-bind:hidden="$datePicker().view !== 'month'" style={{ width: "100%" }}>
                    <div x-date-picker:view-control="{view: 'month'}">
                      <button x-date-picker:prev-trigger="{view: 'month'}">Prev</button>
                      <button
                        x-date-picker:view-trigger="{view: 'month'}"
                        x-text="$datePicker().visibleRange.start.year"
                      ></button>
                      <button x-date-picker:next-trigger="{view: 'month'}">Next</button>
                    </div>

                    <table x-date-picker:table="{view: 'month', columns: 4}">
                      <tbody x-date-picker:table-body="{view: 'month'}">
                        <template
                          x-for="months in $datePicker().getMonthsGrid({columns: 4, format: 'short'})"
                          x-bind:key="months.at(0).value"
                        >
                          <tr x-date-picker:table-row>
                            <template x-for="month in months" x-bind:key="month.value">
                              <td x-date-picker:month-table-cell="{...month, columns: 4}">
                                <div
                                  x-date-picker:month-table-cell-trigger="{...month, columns: 4}"
                                  x-text="month.label"
                                ></div>
                              </td>
                            </template>
                          </tr>
                        </template>
                      </tbody>
                    </table>
                  </div>

                  <div x-bind:hidden="$datePicker().view !== 'year'" style={{ width: "100%" }}>
                    <div x-date-picker:view-control="{view: 'year'}">
                      <button x-date-picker:prev-trigger="{view: 'year'}">Prev</button>
                      <span x-text="$datePicker().getDecade().start + ' - ' + $datePicker().getDecade().end"></span>
                      <button x-date-picker:next-trigger="{view: 'year'}">Next</button>
                    </div>

                    <table x-date-picker:table="{view: 'year', columns: 4}">
                      <tbody x-date-picker:table-body>
                        <template
                          x-for="(years, row) in $datePicker().getYearsGrid({columns: 4})"
                          x-bind:key="years.at(0).value"
                        >
                          <tr x-date-picker:table-row="{view: 'year'}">
                            <template x-for="(year, index) in years" x-bind:key="year.value">
                              <td x-date-picker:year-table-cell="{...year, columns: 4}">
                                <div
                                  x-date-picker:year-table-cell-trigger="{...year, columns: 4}"
                                  x-text="year.label"
                                ></div>
                              </td>
                            </template>
                          </tr>
                        </template>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </main>

          <Toolbar viz>
            <Controls config={datePickerControls} />
            <StateVisualizer label="date-picker" omit={["weeks"]} />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
