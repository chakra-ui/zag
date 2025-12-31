import { defineHandler } from "nitro/h3"
import { getControlDefaults, progressControls } from "@zag-js/shared"
import { Controls } from "../components/controls"
import { Head } from "../components/head"
import { Nav } from "../components/nav"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default defineHandler((event) => {
  const state = getControlDefaults(progressControls)

  return (
    <html>
      <Head>
        <script type="module" src="/scripts/progress.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data={JSON.stringify(state)}
          x-id="['progress']"
          x-progress={`{id: $id('progress'), ${Object.keys(state)}}`}
        >
          <Nav pathname={event.url.pathname} />

          <main class="progress">
            <div x-progress:root>
              <div x-progress:label>Upload progress</div>

              <svg x-progress:circle>
                <circle x-progress:circle-track />
                <circle x-progress:circle-range />
              </svg>

              <div x-progress:track>
                <div x-progress:range />
              </div>

              <div x-progress:value-text x-text="$progress().valueAsString"></div>

              <div>
                <button x-on:click="$progress().setValue(($progress().value ?? 0) - 20)">Decrease</button>
                <button x-on:click="$progress().setValue(($progress().value ?? 0) + 20)">Increase</button>
                <button x-on:click="$progress().setValue(null)">Indeterminate</button>
              </div>
            </div>
          </main>

          <Toolbar>
            <Controls config={progressControls} state={state} slot="controls" />
            <StateVisualizer label="progress" />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
