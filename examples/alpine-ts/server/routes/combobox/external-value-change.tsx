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
          x-data="{value: ['react'], options: $frameworks}"
          x-combobox:collection="{
            items: options,
            itemToValue: (item) => item.value,
            itemToString: (item) => item.label,
          }"
          x-combobox="{
            id: $id('combobox'),
            collection,
            value,
            onValueChange(e) {
              value = e.value;
            },
            onOpenChange() {
              options = $frameworks;
            },
            onInputValueChange({ inputValue }) {
              const filtered = $frameworks.filter((item) => $contains(item.label, inputValue));
              options = filtered.length > 0 ? filtered : $frameworks;
            },
            placeholder: 'Type to search',
          }"
        >
          <Nav currentComponent={event.context.currentComponent as string} />

          <main class="combobox" style={{ padding: "2rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "320px" }}>
              <div style={{ fontSize: "0.875rem" }}>
                <strong>Selected:</strong>
                <div x-text="value.length > 0 ? value.join(', ') : 'N/A'"></div>
                <pre
                  style={{ maxWidth: 400, overflow: "auto" }}
                  x-text="JSON.stringify(collection.toString(), null, 2)"
                ></pre>
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
                  <template x-for="item in options" x-bind:key="item.value">
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

              <button
                data-testid="set-solid-button"
                x-on:click="() => {
                  options = $frameworks;
                  value = ['solid'];
                }"
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#3182ce",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Set value to &quot;Solid&quot; externally
              </button>
            </div>
          </main>
        </div>
      </body>
    </html>
  )
})
