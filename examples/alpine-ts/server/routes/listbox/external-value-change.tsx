import { defineHandler } from "nitro/h3"
import { Head } from "../../components/head"
import { Nav } from "../../components/nav"

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/listbox.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data="{value: [], options: $items}"
          x-listbox:collection="{
                items: options,
                itemToValue: (item) => item.value,
                itemToString: (item) => item.label,
              }"
          x-listbox="{id: $id('listbox'), collection, value, onValueChange: (e) => {value = e.value}}"
        >
          <Nav currentComponent={event.context.currentComponent as string} />

          <main class="listbox" style={{ padding: "2rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "320px" }}>
              <div data-testid="selected-items" style={{ fontSize: "0.875rem" }}>
                <strong>Selected items (from api):</strong>
                <div x-text="$listbox().selectedItems.map((item) => item.label).join(', ')"></div>
              </div>
              <div x-listbox:root>
                <label x-listbox:label>Select framework</label>
                <ul data-testid="listbox-content" x-listbox:content>
                  <template x-for="item in options" x-bind:key="item.value">
                    <li x-bind:data-testid="item.value" x-listbox:item="{ item }">
                      <span x-listbox:item-text="{ item }" x-text="item.label"></span>
                      <span x-listbox:item-indicator="{ item }">✓</span>
                    </li>
                  </template>
                </ul>
              </div>

              <button data-testid="filter-vue-button" x-on:click="options = [$items[1]]">
                Filter to Vue
              </button>
              <button data-testid="set-solid-button" x-on:click="options = $items; value = ['solid'];">
                Set value to Solid
              </button>
            </div>
          </main>
        </div>
      </body>
    </html>
  )
})
