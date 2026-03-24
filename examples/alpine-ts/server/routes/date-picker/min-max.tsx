import { defineHandler } from "nitro/h3"
import { Head } from "../../components/head"
import { Nav } from "../../components/nav"
import { Toolbar } from "../../components/toolbar"
import { StateVisualizer } from "../../components/state-visualizer"

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/date-picker.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data
          x-date-picker="{
            id: $id('date-picker'),
            locale: 'en',
            selectionMode: 'single',
            min: $parse('2025-07-01'),
            max: $parse('2025-09-30'),
          }"
        >
          <Nav currentComponent={event.context.currentComponent as string} />

          <main class="date-picker">
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
                    <template x-for="year in $datePicker().getYears()" x-bind:key="year.value">
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
              </div>
            </div>
          </main>

          <Toolbar viz controls={false}>
            <StateVisualizer label="date-picker" omit={["weeks"]} />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
