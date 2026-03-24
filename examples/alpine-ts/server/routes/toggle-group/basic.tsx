import { defineHandler } from "nitro/h3"
import { toggleGroupControls, toggleGroupData } from "@zag-js/shared"
import { Controls } from "../../components/controls"
import { Head } from "../../components/head"
import { Nav } from "../../components/nav"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/toggle-group.ts"></script>
      </Head>

      <body>
        <div class="page" x-data="toggle" x-id="['toggle']" x-toggle={`{id: $id('toggle'), ...context}`}>
          <Nav currentComponent={event.context.currentComponent as string} />

          <main class="toggle-group">
            <button>Outside</button>
            <div x-toggle:root>
              {toggleGroupData.map((item) => (
                <button x-toggle:item={`{value: '${item.value}'}`}>{item.label}</button>
              ))}
            </div>
          </main>

          <Toolbar>
            <Controls config={toggleGroupControls} slot="controls" />
            <StateVisualizer label="toggle" context={["focusedId"]} />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
