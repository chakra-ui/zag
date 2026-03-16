import { dateInputControls } from "@zag-js/shared"
import { defineHandler } from "nitro/h3"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { Head } from "../../components/head"
import { Nav } from "../../components/nav"
import { Controls } from "../../components/controls"

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/date-input.ts"></script>
      </Head>

      <body>
        <div class="page" x-data="dateInput" x-date-input="{id: $id('date-input'), ...context}">
          <Nav currentComponent={event.context.currentComponent as string} />

          <main class="date-input">
            <div x-date-input:root>
              <label x-date-input:label>Date</label>

              <div x-date-input:control>
                <div x-date-input:segment-group>
                  <template x-for="(segment, i) in $dateInput().getSegments()" x-bind:key="i">
                    <span x-date-input:segment="{ segment }" x-text="segment.text" />
                  </template>
                </div>
              </div>

              <input x-date-input:hidden-input />
            </div>

            <output class="date-output">
              <div x-text="'Selected: ' + ($dateInput().valueAsString.join(', ') || '-')" />
              <div x-text="'Placeholder: ' + $dateInput().placeholderValue.toString()" />
              <div x-text="'Editing: ' + ($dateInput().displayValues?.[0]?.toString() ?? '-')" />
            </output>
          </main>

          <Toolbar viz>
            <Controls config={dateInputControls} slot="controls" />
            <StateVisualizer label="date-input" />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
