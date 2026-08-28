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
          x-data
          x-date-picker="{
            id: $id('date-picker'),
            locale: 'en',
            selectionMode: 'multiple',
            minView: 'month',
            maxSelectedDates: 2,
          }"
        >
          <Nav currentComponent={event.context.currentComponent as string} />

          <main class="date-picker">
            <output class="date-output">
              <div x-text="'Selected: ' + ($datePicker().valueAsString ?? '-')"></div>
            </output>

            <div x-date-picker:control>
              <input x-date-picker:input />
              <button x-date-picker:trigger>🗓</button>
            </div>

            <div x-date-picker:positioner>
              <div x-date-picker:content>
                <div x-bind:hidden="$datePicker().view !== 'month'">
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
