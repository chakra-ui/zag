import { defineHandler } from "nitro"
import { Head } from "../../components/head"
import { Nav } from "../../components/nav"

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/combobox.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data="{value: ['react']}"
          x-combobox:collection="{
            items: $items,
            itemToValue: (item) => item.value,
            itemToString: (item) => item.label,
          }"
          x-combobox="{
            id: $id('combobox'),
            collection,
            value,
            multiple: true,
            openOnClick: true,
          }"
        >
          <Nav currentComponent={event.context.currentComponent as string} />

          <main class="combobox" style={{ padding: "2rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "320px" }}>
              <div style={{ fontSize: "0.875rem" }}>
                <strong>Value (controlled, fixed):</strong>
                <div x-text="value.join(', ')"></div>
              </div>
              <div data-testid="selected-items" style={{ fontSize: "0.875rem" }}>
                <strong>Selected items (from api):</strong>
                <div
                  x-text="$combobox().selectedItems.map((item) =>
                    (typeof item === 'string' ? item : item.label)).join(', ')"
                ></div>
              </div>
              <div style={{ fontSize: "0.75rem", color: "#666" }}>
                Expected: both should show &quot;React&quot;. Bug: selectedItems may show &quot;React, Vue&quot; after
                selecting Vue.
              </div>

              <div>
                <label x-combobox:label>Select framework</label>
                <div x-combobox:control style={{ display: "flex", marginTop: "4px" }}>
                  <input
                    data-testid="input"
                    x-combobox:input
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                  />
                  <button data-testid="trigger" x-combobox:trigger style={{ padding: "8px" }}>
                    ▼
                  </button>
                </div>
              </div>

              <div x-combobox:positioner>
                <ul
                  data-testid="combobox-content"
                  x-combobox:content
                  style={{
                    listStyle: "none",
                    margin: 0,
                    padding: "4px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    marginTop: "4px",
                    maxHeight: "200px",
                    overflow: "auto",
                  }}
                >
                  <template x-for="item in $items" x-bind:key="item.value">
                    <li
                      x-bind:data-testid="item.value"
                      x-combobox:item="{ item }"
                      style={{
                        padding: "8px 12px",
                        cursor: "pointer",
                      }}
                      x-text="item.label"
                    ></li>
                  </template>
                </ul>
              </div>
            </div>
          </main>
        </div>
      </body>
    </html>
  )
})
