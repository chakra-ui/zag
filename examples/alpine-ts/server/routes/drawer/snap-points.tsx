import { drawerControls } from "@zag-js/shared"
import { defineHandler } from "nitro"
import { Controls } from "../../components/controls"
import { Head } from "../../components/head"
import { Nav } from "../../components/nav"
import { Presence } from "../../components/presence"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import styles from "../../../../shared/styles/drawer.module.css"

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/drawer.ts"></script>
      </Head>

      <body>
        <div class="page" x-data="drawer" x-drawer="{id: $id('drawer'), snapPoints: [0.25, '250px', 1], ...context}">
          <Nav currentComponent={event.context.currentComponent as string} />

          <main>
            <button class={styles.trigger} x-drawer:trigger>
              Open
            </button>
            <Presence class={styles.backdrop} x-drawer:backdrop x-data="{get present() {return $drawer().open}}" />
            <div class={styles.positioner} x-drawer:positioner>
              <Presence class={styles.content} x-drawer:content x-data="{get present() {return $drawer().open}}">
                <div class={styles.grabber} x-drawer:grabber>
                  <div class={styles.grabberIndicator} x-drawer:grabber-indicator />
                </div>
                <div x-drawer:title>Drawer</div>
                <div data-no-drag class={styles.noDrag}>
                  No drag area
                </div>
                <div class={styles.scrollable}>
                  {Array.from({ length: 100 }).map((_element, index) => (
                    <div key={index}>Item {index}</div>
                  ))}
                </div>
              </Presence>
            </div>
          </main>

          <Toolbar>
            <Controls config={drawerControls} slot="controls" />
            <StateVisualizer label="drawer" context={["dragOffset", "snapPoint", "resolvedActiveSnapPoint"]} />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
