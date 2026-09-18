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
        <div class="page" x-data x-date-picker="{id: $id('date-picker'), locale: 'en', open: false, defaultOpen: true}">
          <Nav currentComponent={event.context.currentComponent as string} />

          <main class="date-picker">
            <div x-date-picker:control>
              <input x-date-picker:input />
              <button x-date-picker:trigger>🗓</button>
            </div>

            <div x-date-picker:positioner>
              <div x-date-picker:content>
                <table x-date-picker:table="{view: 'day'}">
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
          </main>

          <Toolbar viz>
            <StateVisualizer label="date-picker" omit={["weeks"]} />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
