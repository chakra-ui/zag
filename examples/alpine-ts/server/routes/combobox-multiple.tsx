import { defineHandler } from "nitro/h3"
import { getControlDefaults } from "@zag-js/shared"
import { X } from "lucide-static"
import { Controls } from "../components/controls"
import { Head } from "../components/head"
import { Nav } from "../components/nav"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default defineHandler((event) => {
  const config = {
    removeSelected: {
      type: "boolean" as const,
      defaultValue: false,
    },
  }
  const state = getControlDefaults(config)

  return (
    <html>
      <Head>
        <script type="module" src="/scripts/combobox.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data="{
            options: $comboboxData,
            selectedValue: [],
            get items() {
              return this.removeSelected
                ? this.options.filter((item) => !this.selectedValue.includes(item.code))
                : this.options
            },
            removeSelected: false,
          }"
          x-combobox:collection="{
            items,
            itemToValue: (item) => item.code,
            itemToString: (item) => item.label,
          }"
          x-combobox="{
            id: $id('combobox'),
            collection,
            onInputValueChange({ inputValue }) {
              const filtered = $matchSorter($comboboxData, inputValue, {keys: ['label']})
              options = filtered.length > 0 ? filtered : $comboboxData
            },
            multiple: true,
            onValueChange({ value }) {
              selectedValue = value
            },
          }"
        >
          <Nav pathname={event.url.pathname} />

          <main class="combobox">
            <div>
              <b x-text="_x_combobox_service.state.get()"></b>
              <b x-text="' / ' + ($combobox().highlightedValue || '-')"></b>
              <pre data-testid="value-text" x-text="$combobox().valueAsString"></pre>
              <div x-combobox:root>
                <label x-combobox:label>Select country</label>
                <div x-combobox:control>
                  <input data-testid="input" x-combobox:input />
                  <button data-testid="trigger" x-combobox:trigger x-on:click="options = $comboboxData">
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
            <Controls config={config} state={state} slot="controls" />
            <StateVisualizer label="combobox" />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
