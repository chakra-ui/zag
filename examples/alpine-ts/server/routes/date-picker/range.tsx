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
                  name: 'date[]',
                  locale: 'en',
                  numOfMonths: 2,
                  selectionMode: 'range',
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
              <input x-date-picker:input="{index: 0}" />
              <input x-date-picker:input="{index: 1}" />
              <button x-date-picker:clear-trigger>❌</button>
              <button x-date-picker:trigger>🗓</button>
            </div>

            <button x-date-picker:preset-trigger="{value: 'last7Days'}">Last 7 days</button>

            <div x-date-picker:positioner>
              <div x-date-picker:content>
                <div style={{ marginBottom: "20px" }}>
                  <select x-date-picker:month-select>
                    <template x-for="(month, i) in $datePicker().getMonths()" x-bind:key="i">
                      <option x-bind:value="month.value" x-bind:disabled="month.disabled" x-text="month.label"></option>
                    </template>
                  </select>

                  <select x-date-picker:year-select>
                    <template x-for="(year, i) in $datePicker().getYears()" x-bind:key="i">
                      <option x-bind:value="year.value" x-bind:disabled="year.disabled" x-text="year.label"></option>
                    </template>
                  </select>
                </div>

                <div>
                  <div x-date-picker:view-control="{view: 'year'}">
                    <button x-date-picker:prev-trigger="{view: 'year'}">Prev</button>
                    <span x-text="$datePicker().getDecade().start + ' - ' + $datePicker().getDecade().end"></span>
                    <button x-date-picker:next-trigger="{view: 'year'}">Next</button>
                  </div>

                  <div style={{ display: "flex", gap: "24px" }}>
                    <table x-date-picker:table="{id: $id('table')}">
                      <thead x-date-picker:table-header>
                        <tr x-date-picker:table-row>
                          <template x-for="(day, i) in $datePicker().weekDays" x-bind:key="i">
                            <th scope="col" x-bind:aria-label="day.long" x-text="day.narrow"></th>
                          </template>
                        </tr>
                      </thead>
                      <tbody x-date-picker:table-body>
                        <template x-for="(week, i) in $datePicker().weeks" x-bind:key="i">
                          <tr x-date-picker:table-row="{view: 'day'}">
                            <template x-for="(value, i) in week" x-bind:key="i">
                              <td x-date-picker:day-table-cell="{ value }">
                                <div x-date-picker:day-table-cell-trigger="{ value }" x-text="value.day"></div>
                              </td>
                            </template>
                          </tr>
                        </template>
                      </tbody>
                    </table>

                    <table x-date-picker:table="{id: $id('table')}">
                      <thead x-date-picker:table-header>
                        <tr x-date-picker:table-row>
                          <template x-for="(day, i) in $datePicker().weekDays" x-bind:key="i">
                            <th scope="col" x-bind:aria-label="day.long" x-text="day.narrow"></th>
                          </template>
                        </tr>
                      </thead>
                      <tbody x-date-picker:table-body>
                        <template x-for="(week, i) in $datePicker().getOffset({months: 1}).weeks" x-bind:key="i">
                          <tr x-date-picker:table-row>
                            <template x-for="(value, i) in week" x-bind:key="i">
                              <td x-date-picker:day-table-cell="{ value }">
                                <div x-date-picker:day-table-cell-trigger="{ value }" x-text="value.day"></div>
                              </td>
                            </template>
                          </tr>
                        </template>
                      </tbody>
                    </table>

                    <div style={{ minWidth: "80px", display: "flex", flexDirection: "column", gap: "4px" }}>
                      <b>Presets</b>
                      <button x-date-picker:preset-trigger="{value: 'last3Days'}">Last 3 Days</button>
                      <button x-date-picker:preset-trigger="{value: 'last7Days'}">Last 7 Days</button>
                      <button x-date-picker:preset-trigger="{value: 'last14Days'}">Last 14 Days</button>
                      <button x-date-picker:preset-trigger="{value: 'last30Days'}">Last 30 Days</button>
                      <button x-date-picker:preset-trigger="{value: 'last90Days'}">Last 90 Days</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>

          <Toolbar viz>
            <Controls config={datePickerControls} slot="controls" />
            <StateVisualizer label="date-picker" omit={["weeks"]} />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
