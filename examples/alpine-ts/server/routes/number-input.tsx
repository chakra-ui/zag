import { defineHandler } from "nitro/h3"
import { getControlDefaults, numberInputControls } from "@zag-js/shared"
import { Controls } from "../components/controls"
import { Head } from "../components/head"
import { Nav } from "../components/nav"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default defineHandler((event) => {
  const state = getControlDefaults(numberInputControls)

  return (
    <html>
      <Head>
        <script type="module" src="/scripts/number-input.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data={JSON.stringify(state)}
          x-id="['number-input']"
          x-number-input={`{id: $id('number-input'), ${Object.keys(state)}}`}
        >
          <Nav pathname={event.url.pathname} />

          <main>
            <div x-number-input:root>
              <div data-testid="scrubber" x-number-input:scrubber />
              <label data-testid="label" x-number-input:label>
                Enter number:
              </label>
              <div x-number-input:control>
                <button data-testid="dec-button" x-number-input:decrement-trigger>
                  DEC
                </button>
                <input data-testid="input" x-number-input:input />
                <button data-testid="inc-button" x-number-input:increment-trigger>
                  INC
                </button>
              </div>
            </div>
          </main>

          <Toolbar>
            <Controls config={numberInputControls} state={state} slot="controls" />
            <StateVisualizer label="number-input" omit={["formatter", "parser"]} />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
