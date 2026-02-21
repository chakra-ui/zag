import { defineHandler } from "nitro/h3"
import { checkboxControls, getControlDefaults } from "@zag-js/shared"
import { Controls } from "../components/controls"
import { Head } from "../components/head"
import { Nav } from "../components/nav"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default defineHandler((event) => {
  const state = getControlDefaults(checkboxControls)

  return (
    <html>
      <Head>
        <script type="module" src="/scripts/checkbox.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data={JSON.stringify(state)}
          x-id="['checkbox']"
          x-checkbox={`{id: $id('checkbox'), name: 'checkbox', ${Object.keys(state)}}`}
        >
          <Nav pathname={event.url.pathname} />

          <main class="checkbox">
            <form
              x-on:change="(e) => {
                const result = $serialize(e.currentTarget, { hash: true })
                console.log(result)
              }"
            >
              <fieldset>
                <label x-checkbox:root>
                  <div x-checkbox:control />
                  <span x-checkbox:label x-text="'Input ' + ($checkbox().checked ? 'Checked' : 'Unchecked')"></span>
                  <input x-checkbox:hidden-input data-testid="hidden-input" />
                  <div x-checkbox:indicator>Indicator</div>
                </label>

                <button type="button" x-bind:disabled="$checkbox().checked" x-on:click="$checkbox().setChecked(true)">
                  Check
                </button>
                <button
                  type="button"
                  x-bind:disabled="! $checkbox().checked"
                  x-on:click="$checkbox().setChecked(false)"
                >
                  Uncheck
                </button>
                <button type="reset">Reset Form</button>
              </fieldset>
            </form>
          </main>

          <Toolbar>
            <Controls config={checkboxControls} state={state} slot="controls" />
            <StateVisualizer label="checkbox" />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
