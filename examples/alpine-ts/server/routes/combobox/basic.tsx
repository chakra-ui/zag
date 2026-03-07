import { defineHandler } from "nitro/h3"
import { comboboxControls, getControlDefaults } from "@zag-js/shared"
import { X } from "lucide-static"
import { Controls } from "../../components/controls"
import { Head } from "../../components/head"
import { Nav } from "../../components/nav"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

export default defineHandler((event) => {
  const state = getControlDefaults(comboboxControls)

  return (
    <html>
      <Head>
        <script type="module" src="/scripts/combobox.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data={JSON.stringify(state).slice(0, -1) + ", options: $comboboxData, selectedItems: []}"}
          x-combobox:collection="{
            items: options,
            itemToValue: (item) => item.code,
            itemToString: (item) => item.label,
          }"
          x-combobox={`{
            id: $id('combobox'),
            collection,
            onOpenChange() {
              options = $comboboxData
            },
            onInputValueChange({ inputValue }) {
              const filtered = $comboboxData.filter((item) => $contains(item.label, inputValue));
              options = filtered.length > 0 ? filtered : $comboboxData;
            },
            onValueChange({ items }) {
              selectedItems = items
            },
            ${Object.keys(state)},
          }`}
        >
          <Nav currentComponent={event.context.currentComponent as string} />

          <main class="combobox">
            <div>
              <button x-on:click="$combobox().setValue(['TG'])">Set to Togo</button>
              <button data-testid="clear-value-button" x-on:click="$combobox().clearValue()">
                Clear Value
              </button>
              <pre
                data-testid="on-value-change-items"
                x-text="'selectedItems: ' + selectedItems.map((item) => item.label).join(', ') || 'N/A'"
              />
              <br />
              <div x-combobox:root>
                <label x-combobox:label>Select country</label>
                <div x-combobox:control>
                  <input data-testid="input" x-combobox:input />
                  <button data-testid="trigger" x-combobox:trigger>
                    ▼
                  </button>
                  <button x-combobox:clear-trigger>{html(X)}</button>
                </div>
              </div>
              <div x-combobox:positioner>
                <template x-if="options.length > 0">
                  <ul data-testid="combobox-content" x-combobox:content>
                    <template x-for="item in options" x-bind:key="item.code">
                      <li x-bind:data-testid="item.code" x-combobox:item="{ item }">
                        <span x-combobox:item-indicator="{ item }">✅</span>
                        <span x-text="item.label"></span>
                      </li>
                    </template>
                  </ul>
                </template>
              </div>
            </div>
          </main>

          <Toolbar>
            <Controls config={comboboxControls} state={state} slot="controls" />
            <StateVisualizer label="combobox" />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
