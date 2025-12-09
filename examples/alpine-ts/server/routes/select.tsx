import { defineHandler } from "nitro/h3"
import { getControlDefaults, selectControls } from "@zag-js/shared"
import { Controls } from "../components/controls"
import { Head } from "../components/head"
import { Nav } from "../components/nav"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default defineHandler((event) => {
  const state = getControlDefaults(selectControls)

  return (
    <html>
      <Head>
        <script type="module" src="/scripts/select.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data={JSON.stringify(state)}
          x-id="['select']"
          x-select:collection="{items: $selectData}"
          x-select={`{
            collection,
            id: $id('select'),
            name: 'country',
            onHighlightChange(details) {
              console.log('onHighlightChange', details)
            },
            onValueChange(details) {
              console.log('onChange', details)
            },
            onOpenChange(details) {
              console.log('onOpenChange', details)
            },
            ${Object.keys(state)},
          }`}
        >
          <Nav pathname={event.url.pathname} />

          <main class="select">
            <div x-select:root>
              <label x-select:label>Label</label>
              {/* control */}
              <div x-select:control>
                <button x-select:trigger>
                  <span x-text="$select().valueAsString || 'Select option'"></span>
                  <span x-select:indicator>▼</span>
                </button>
                <button x-select:clear-trigger>X</button>
              </div>

              <form
                x-on:change="(e) => {
                  const formData = $serialize(e.currentTarget, { hash: true })
                  console.log(formData)
                }"
              >
                {/* Hidden select */}
                <select x-select:hidden-select>
                  <template x-if="$select().empty">
                    <option value="" />
                  </template>
                  <template x-for="option in $selectData" x-bind:key="option.value">
                    <option x-bind:value="option.value" x-text="option.label"></option>
                  </template>
                </select>
              </form>

              {/* UI select */}
              <template x-teleport="body">
                <div x-select:positioner>
                  <ul x-select:content>
                    <template x-for="item in $selectData" x-bind:key="item.value">
                      <li x-select:item="{ item }">
                        <span x-select:item-text="{ item }" x-text="item.label"></span>
                        <span x-select:item-indicator="{ item }">✓</span>
                      </li>
                    </template>
                  </ul>
                </div>
              </template>
            </div>
          </main>

          <Toolbar>
            <Controls config={selectControls} state={state} slot="controls" />
            <StateVisualizer label="select" />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
