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
          x-data="{hideTimeZone: false, timeZone: 'America/Los_Angeles'}"
          x-date-input="{
            id: $id('date-input'),
            locale: 'en-US',
            granularity: 'minute',
            timeZone,
            hideTimeZone,
            defaultValue: [$parseZonedDateTime('2025-02-03T08:45:00[America/Los_Angeles]')]
          }"
        >
          <Nav currentComponent={event.context.currentComponent as string} />

          <main class="date-input">
            <div x-date-input:root>
              <label x-date-input:label>Meeting time</label>

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
              <div x-text="'Time zone: ' + timeZone"></div>
            </output>

            <label style={{ display: "block", marginTop: "12px" }}>
              <input type="checkbox" data-testid="hide-tz" x-model="hideTimeZone" /> Hide time zone
            </label>
          </main>

          <Toolbar viz>
            <StateVisualizer label="date-input" />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
