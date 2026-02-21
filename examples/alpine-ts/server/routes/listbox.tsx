import { defineHandler } from "nitro/h3"
import { getControlDefaults, listboxControls } from "@zag-js/shared"
import { Controls } from "../components/controls"
import { Head } from "../components/head"
import { Nav } from "../components/nav"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default defineHandler((event) => {
  const state = getControlDefaults(listboxControls)

  return (
    <html>
      <Head>
        <script type="module" src="/scripts/listbox.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data={JSON.stringify(state)}
          x-listbox:collection="{items: $selectData}"
          x-listbox={`{collection, id: $id('listbox'), ${Object.keys(state)}}`}
        >
          <Nav pathname={event.url.pathname} />

          <main class="listbox">
            <div x-listbox:root>
              <label x-listbox:label>Label</label>
              <ul x-listbox:content>
                <template x-for="item in $selectData" x-bind:key="item.value">
                  <li x-listbox:item="{ item }">
                    <span x-listbox:item-text="{ item }" x-text="item.label"></span>
                    <span x-listbox:item-indicator="{ item }">✓</span>
                  </li>
                </template>
              </ul>
            </div>
          </main>

          <Toolbar>
            <Controls config={listboxControls} state={state} slot="controls" />
            <StateVisualizer label="listbox" context={["highlightedValue"]} />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
