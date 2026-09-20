import { defineHandler } from "nitro"
import { Head } from "../../components/head"
import { Nav } from "../../components/nav"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/date-input.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data
          x-date-input="{id: $id('date-input'), locale: 'en-US', granularity: 'minute', hourCycle: 24}"
        >
          <Nav currentComponent={event.context.currentComponent as string} />

          <main class="date-input">
            <div x-date-input:root>
              <label x-date-input:label>Appointment time</label>

              <div x-date-input:control>
                <div x-date-input:segment-group>
                  <template x-for="(segment, i) in $dateInput().getSegments()" x-bind:key="segment.type + i">
                    <span x-date-input:segment="{ segment }" x-text="segment.text" />
                  </template>
                </div>
              </div>

              <input x-date-input:hidden-input />
            </div>

            <output class="date-output">
              <div x-text="'Selected: ' + ($dateInput().valueAsString.join(', ') || '-')"></div>
            </output>
          </main>

          <Toolbar viz>
            <StateVisualizer label="date-input" />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
