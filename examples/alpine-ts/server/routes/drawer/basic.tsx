import { defineHandler } from "nitro/h3"
import { drawerControls, getControlDefaults } from "@zag-js/shared"
import { Controls } from "../../components/controls"
import { Head } from "../../components/head"
import { Nav } from "../../components/nav"
import { Presence } from "../../components/presence"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

export default defineHandler((event) => {
  const state = getControlDefaults(drawerControls)

  return (
    <html>
      <Head>
        <script type="module" src="/scripts/drawer.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data={JSON.stringify(state)}
          x-id="['drawer']"
          x-drawer={`{id: $id('drawer'), ${Object.keys(state)}}`}
        >
          <Nav currentComponent={event.context.currentComponent as string} />

          <main class="drawer" x-data="{hidden: !$drawer.open}">
            <button x-drawer:trigger>Open</button>
            <Presence x-drawer:backdrop x-on:animationstart="(e)=> console.log(e)" />
            <Presence x-drawer:content x-on:animationstart="(e) => console.log(e)">
              <div x-drawer:grabber>
                <div x-drawer:grabber-indicator />
              </div>
              <div x-drawer:title>Drawer</div>
              <div data-no-drag="true">No drag area</div>
              <div class="scrollable">
                {Array.from({ length: 100 }).map((_element, index) => (
                  <div>Item {index}</div>
                ))}
              </div>
            </Presence>
          </main>

          <Toolbar>
            <Controls config={drawerControls} state={state} slot="controls" />
            <StateVisualizer label="drawer" context={["dragOffset", "activeSnapPoint", "resolvedActiveSnapPoint"]} />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
