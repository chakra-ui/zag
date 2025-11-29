import { defineHandler } from "nitro/h3"
import { getControlDefaults, toggleGroupControls, toggleGroupData } from "@zag-js/shared"
import { Controls } from "../components/controls"
import { Head } from "../components/head"
import { Nav } from "../components/nav"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default defineHandler((event) => {
  const state = getControlDefaults(toggleGroupControls)

  return (
    <html>
      <Head>
        <script type="module" src="/scripts/toggle-group.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data={JSON.stringify(state)}
          x-id="['toggle']"
          x-toggle={`{id: $id('toggle'), ${Object.keys(state)}}`}
        >
          <Nav pathname={event.url.pathname} />

          <main class="toggle-group">
            <button>Outside</button>
            <div x-toggle:root>
              {toggleGroupData.map((item) => (
                <button x-toggle:item={`{value: '${item.value}'}`}>{item.label}</button>
              ))}
            </div>
          </main>

          <Toolbar>
            <Controls config={toggleGroupControls} state={state} slot="controls" />
            <StateVisualizer label="toggle" context={["focusedId"]} />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
