import { defineHandler } from "nitro"
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
          x-data="{
            format(date) {
              const month = date.month.toString().padStart(2, '0');
              const year = date.year.toString();
              return `${month}/${year}`;
            },
            parse(string) {
              // Handle full mm/yyyy format
              const fullRegex = /^(\d{1,2})\/(\d{4})$/;
              const fullMatch = string.match(fullRegex);
              if (fullMatch) {
                const [_, month, year] = fullMatch.map(Number);
                return new $CalendarDate(year, month, 1);
              }

              return undefined;
            },
          }"
          x-date-picker="{
            id: $id('date-picker'),
            locale: 'en',
            minView: 'month',
            placeholder: 'mm/yyyy',
            format,
            parse,
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
            <StateVisualizer label="date-picker" omit={["weeks"]} />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
