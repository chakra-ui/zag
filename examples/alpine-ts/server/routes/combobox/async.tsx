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
          x-data="{selected: []}"
          x-data:async-list="asyncList"
          x-combobox:collection="{
            items: asyncList.value.items,
            itemToValue: (item) => item.name,
            itemToString: (item) => item.name,
          }"
          x-combobox="{
            id: $id('combobox'),
            collection,
            placeholder: 'Search people...',
            onInputValueChange({ inputValue }) {
              asyncList.value.setFilterText(inputValue);
            },
            onValueChange({ value }) {
              selected = value;
            },
          }"
        >
          <Nav currentComponent={event.context.currentComponent as string} />

          <main class="combobox" style={{ padding: "2rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "360px" }}>
              <div data-testid="selected-value" style={{ fontSize: "0.875rem" }}>
                <strong>Selected:</strong>
                <div x-text="selected.join(', ')"></div>
              </div>

              <div x-combobox:root>
                <label x-combobox:label>Search Star Wars characters</label>
                <div x-combobox:control style={{ display: "flex", marginTop: "4px" }}>
                  <input data-testid="input" x-combobox:input style={{ flex: 1, padding: "8px 12px" }} />
                  <button data-testid="trigger" x-combobox:trigger style={{ padding: "8px" }}>
                    ▼
                  </button>
                </div>
              </div>

              <template x-if="asyncList.value.loading">
                <div data-testid="loading" style={{ fontSize: "0.875rem" }}>
                  Loading...
                </div>
              </template>

              <div x-combobox:positioner>
                <template x-if="$combobox().collection.items.length > 0">
                  <ul data-testid="combobox-content" x-combobox:content style={{ listStyle: "none", padding: "4px" }}>
                    <template x-for="item in $combobox().collection.items" x-bind:key="item.name">
                      <li
                        x-bind:data-testid="'item-' + item.name"
                        x-combobox:item="{ item }"
                        style={{ padding: "8px 12px", cursor: "pointer" }}
                        x-text="item.name"
                      ></li>
                    </template>
                  </ul>
                </template>
              </div>
            </div>
          </main>
        </div>
      </body>
    </html>
  )
})
