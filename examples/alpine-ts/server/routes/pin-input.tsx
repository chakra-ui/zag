import { defineHandler } from "nitro/h3"
import { getControlDefaults, pinInputControls } from "@zag-js/shared"
import { Controls } from "../components/controls"
import { Head } from "../components/head"
import { Nav } from "../components/nav"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default defineHandler((event) => {
  const state = getControlDefaults(pinInputControls)

  return (
    <html>
      <Head>
        <script type="module" src="/scripts/pin-input.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data={JSON.stringify(state)}
          x-id="['pin-input']"
          x-pin-input={`{name: 'test', id: $id('pin-input'), count: 3, ${Object.keys(state)}}`}
        >
          <Nav pathname={event.url.pathname} />

          <main class="pin-input">
            <form
              x-on:submit="(e) => {
                e.preventDefault()
                const formData = $serialize(e.currentTarget, { hash: true })
                console.log(formData)
              }"
            >
              <div x-pin-input:root>
                <label x-pin-input:label>Enter code:</label>
                <div x-pin-input:control>
                  <template x-for="index in $pinInput().items" x-bind:key="index">
                    <input x-bind:data-testid="'input-' + (index + 1)" x-pin-input:input="{ index }" />
                  </template>
                </div>
                <input x-pin-input:hidden-input />
              </div>
              <button data-testid="clear-button" x-on:click="$pinInput().clearValue">
                Clear
              </button>
              <button x-on:click="$pinInput().focus">Focus</button>
            </form>
          </main>

          <Toolbar>
            <Controls config={pinInputControls} state={state} slot="controls" />
            <StateVisualizer label="pin-input" context={["value", "focusedIndex"]} />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
