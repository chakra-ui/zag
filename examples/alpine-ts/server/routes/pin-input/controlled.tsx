import { defineHandler } from "nitro"
import { Head } from "../../components/head"
import { Nav } from "../../components/nav"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/pin-input.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data="{value: ['', '', '']}"
          x-pin-input="{
            id: $id('pin-input'),
            name: 'test',
            count: 3,
            value,
            onValueChange(details) {
              value = details.value
            },
          }"
        >
          <Nav currentComponent={event.context.currentComponent as string} />

          <main class="pin-input">
            <form {...{ "x-on:submit.prevent": "(e) => console.log('submitted:', value.join(''))" }}>
              <div x-pin-input:root>
                <label x-pin-input:label>Enter code:</label>
                <div x-pin-input:control>
                  <template x-for="index in $pinInput().items" x-bind:key="index">
                    <input x-bind:data-testid="`input-${index + 1}`" x-pin-input:input="{ index }" />
                  </template>
                </div>
                <input x-pin-input:hidden-input />
              </div>

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                <button type="button" data-testid="clear-button" x-on:click="$pinInput().clearValue">
                  Clear
                </button>
                <button type="button" x-on:click="$pinInput().focus">
                  Focus
                </button>
                <button type="button" data-testid="set-value" x-on:click="value = ['1', '2', '3']">
                  Set 1-2-3
                </button>
                <button type="button" data-testid="reset-value" x-on:click="value = ['', '', '']">
                  Reset
                </button>
              </div>
            </form>

            <div style={{ marginTop: "1rem", padding: "0.5rem", background: "#f5f5f5", borderRadius: "4px" }}>
              <strong>Controlled value:</strong> <div x-text="'[' + value.map((v)  => `'${v}'`).join(', ') + ']'"></div>
            </div>
          </main>

          <Toolbar>
            <StateVisualizer label="pin-input" context={["value", "focusedIndex"]} />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
