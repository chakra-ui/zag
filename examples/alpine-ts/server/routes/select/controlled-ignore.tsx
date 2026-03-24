import { defineHandler } from "nitro/h3"
import { Head } from "../../components/head"
import { Nav } from "../../components/nav"

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/select.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data="{value: ['react']}"
          x-select:collection="{
            items: $items,
            itemToValue: (item) => item.value,
            itemToString: (item) => item.label,
          }"
          x-select="{id: $id('select'), collection, value}"
        >
          <Nav currentComponent={event.context.currentComponent as string} />

          <main class="select" style={{ padding: "2rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "320px" }}>
              <div style={{ fontSize: "0.875rem" }}>
                <strong>Value (controlled, fixed):</strong>
                <div x-text="value.join(', ')"></div>
              </div>
              <div data-testid="selected-items" style={{ fontSize: "0.875rem" }}>
                <strong>Selected items (from api):</strong>
                <div x-text="$select().selectedItems.map((item) => item.label).join(', ')"></div>
              </div>

              <div x-select:root>
                <label x-select:label>Select framework</label>
                <div x-select:control style={{ display: "flex", marginTop: "4px" }}>
                  <button data-testid="trigger" x-select:trigger style={{ padding: "8px 12px", flex: 1 }}>
                    <span x-text="$select.valueAsString || 'Select option'"></span>
                    <span style={{ marginLeft: "8px" }}>▼</span>
                  </button>
                </div>

                <template x-teleport="body">
                  <div x-select:positioner>
                    <ul data-testid="select-content" x-select:content style={{ listStyle: "none", padding: "4px" }}>
                      <template x-for="item in $items" x-bind:key="item.value">
                        <li x-bind:data-testid="item.value" x-select:item="{ item }" style={{ padding: "8px 12px" }}>
                          <span x-select:item-text="{ item }" x-text="item.label"></span>
                          <span x-select:item-indicator="{ item }">✓</span>
                        </li>
                      </template>
                    </ul>
                  </div>
                </template>
              </div>
            </div>
          </main>
        </div>
      </body>
    </html>
  )
})
