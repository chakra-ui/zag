import { defineHandler } from "nitro/h3"
import { switchControls } from "@zag-js/shared"
import { Controls } from "../../components/controls"
import { Head } from "../../components/head"
import { Nav } from "../../components/nav"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/switch.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data="zagSwitch"
          x-id="['switch']"
          x-switch={`{id: $id('switch'), name: 'switch', ...context}`}
        >
          <Nav currentComponent={event.context.currentComponent as string} />

          <main class="switch">
            <label x-switch:root>
              <input x-switch:hidden-input data-testid="hidden-input" />
              <span x-switch:control>
                <span x-switch:thumb />
              </span>
              <span x-switch:label x-text="'Feature is ' + ($switch().checked ? 'enabled' : 'disabled')"></span>
            </label>
          </main>

          <Toolbar>
            <Controls config={switchControls} slot="controls" />
            <StateVisualizer label="switch" />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
