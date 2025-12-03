import { defineHandler } from "nitro/h3"
import { getControlDefaults, menuControls } from "@zag-js/shared"
import { Controls } from "../components/controls"
import { Head } from "../components/head"
import { Nav } from "../components/nav"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default defineHandler((event) => {
  const state = getControlDefaults(menuControls)

  return (
    <html>
      <Head>
        <script type="module" src="/scripts/menu.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data={JSON.stringify(state)}
          x-menu={`{id: $id('menu'), onSelect: console.log, ${Object.keys(state)}}`}
        >
          <Nav pathname={event.url.pathname} />

          <main>
            <div>
              <button x-menu:trigger>
                Actions <span x-menu:indicator>▾</span>
              </button>
              <template x-if="$menu().open">
                <div x-menu:positioner>
                  <ul x-menu:content>
                    <li x-menu:item="{value: 'edit'}">Edit</li>
                    <li x-menu:item="{value: 'duplicate'}">Duplicate</li>
                    <li x-menu:item="{value: 'delete'}">Delete</li>
                    <li x-menu:item="{value: 'export'}">Export...</li>
                  </ul>
                </div>
              </template>
            </div>
          </main>

          <Toolbar>
            <Controls config={menuControls} state={state} slot="controls" />
            <StateVisualizer label="menu" />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
