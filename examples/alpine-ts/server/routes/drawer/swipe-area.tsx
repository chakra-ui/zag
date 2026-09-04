import { defineHandler } from "nitro"
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
        <div class="page" x-data x-drawer="{id: $id('drawer')}">
          <Nav currentComponent={event.context.currentComponent as string} />

          <main>
            <div class={styles.swipeArea} x-drawer:swipe-area />
            <Presence class={styles.backdrop} x-drawer:backdrop x-data="{get present() {return $drawer().open}}" />
            <div class={styles.positioner} x-drawer:positioner>
              <Presence class={styles.content} x-drawer:content x-data="{get present() {return $drawer().open}}">
                <div class={styles.grabber} x-drawer:grabber>
                  <div class={styles.grabberIndicator} x-drawer:grabber-indicator />
                </div>
                <div x-drawer:title>Drawer</div>
                <p x-drawer:description>Swipe up from the bottom edge to open this drawer.</p>
                <button x-drawer:close-trigger>Close</button>
                <div class={styles.scrollable} data-testid="scrollable">
                  {Array.from({ length: 100 }).map((_element, index) => (
                    <div>Item {index}</div>
                  ))}
                </div>
              </Presence>
            </div>
          </main>

          <Toolbar>
            <StateVisualizer label="drawer" context={["dragOffset", "snapPoint", "contentSize"]} />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
