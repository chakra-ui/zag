import { dateInputControls } from "@zag-js/shared"
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
        <script type="module" src="/scripts/date-input.ts"></script>
      </Head>

      <body>
        <div class="page" x-data="dateInput" x-date-input="{id: $id('date-input'), selectionMode: 'range', ...context}">
          <Nav currentComponent={event.context.currentComponent as string} />

          <main class="date-input">
            <div x-date-input:root>
              <label x-date-input:label>Date Range</label>

              <div x-date-input:control>
                <div x-date-input:segment-group="{ index: 0 }">
                  <template
                    x-for="(segment, i) in $dateInput().getSegments({ index: 0 })"
                    x-bind:key="segment.type + i"
                  >
                    <span x-date-input:segment="{ segment }" x-text="segment.text" />
                  </template>
                </div>

                <span> &ndash; </span>

                <div x-date-input:segment-group="{ index: 1 }">
                  <template
                    x-for="(segment, i) in $dateInput().getSegments({ index: 1 })"
                    x-bind:key="segment.type + i"
                  >
                    <span x-date-input:segment="{ segment }" x-text="segment.text" />
                  </template>
                </div>
              </div>

              <input x-date-input:hidden-input="{index: 0}" />
              <input x-date-input:hidden-input="{index: 1}" />
            </div>

            <output class="date-output">
              <div x-text="'Selected: ' + ($dateInput().valueAsString.join(' - ') || '-')" />
              <div x-text="'Placeholder: ' + $dateInput().placeholderValue.toString()" />
              <template x-for="(date, index) in $dateInput().displayValues" x-bind:key="index">
                <div x-text="'Editing input ' + (index+1) + ': ' + (date.toString() ?? '-')" />
              </template>
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
