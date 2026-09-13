import { comboboxControls } from "@zag-js/shared"
import { X } from "lucide-static"
import { defineHandler } from "nitro"
import { Controls } from "../../components/controls"
import { Head } from "../../components/head"
import { Nav } from "../../components/nav"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/combobox.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data="{options: $comboboxData, submitCount: 0, lastSubmit: null}"
          x-data:controls="combobox"
          x-combobox:collection="{
            items: options,
            itemToValue: (item) => item.code,
            itemToString: (item) => item.label,
          }"
          x-combobox="{
            id: $id('combobox'),
            collection,
            name: 'country',
            onOpenChange() {
              options = $comboboxData;
            },
            onInputValueChange({ inputValue }) {
              const filtered = $comboboxData.filter((item) => $contains(item.label, inputValue));
              options = filtered;
            },
            ...context
          }"
        >
          <Nav currentComponent={event.context.currentComponent as string} />

          <main class="combobox">
            <form
              x-on:submit="(e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                const value = String(data.get('country') ?? '');
                submitCount++;
                lastSubmit = value;
              }"
            >
              <div x-combobox:root>
                <label x-combobox:label>Select country</label>
                <div x-combobox:control>
                  <input data-testid="input" x-combobox:input />
                  <button data-testid="trigger" type="button" x-combobox:trigger>
                    ▼
                  </button>
                  <button type="button" x-combobox:clear-trigger>
                    {html(X)}
                  </button>
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

              <div style={{ marginTop: 16 }}>
                <button type="submit">Submit</button>
              </div>
            </form>

            <section style={{ marginTop: 16 }}>
              <strong>submit count:</strong> <span data-testid="submit-count" x-text="submitCount"></span>
              <br />
              <strong>last submitted value:</strong> <span data-testid="last-submit" x-text="lastSubmit ?? '-'"></span>
            </section>
          </main>

          <Toolbar>
            <Controls config={comboboxControls} slot="controls" />
            <StateVisualizer label="combobox" />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
