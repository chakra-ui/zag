import { defineHandler } from "nitro/h3"
import { bottomSheetControls, getControlDefaults } from "@zag-js/shared"
import { Controls } from "../components/controls"
import { Head } from "../components/head"
import { Nav } from "../components/nav"
import { Presence } from "../components/presence"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default defineHandler((event) => {
  const state = getControlDefaults(bottomSheetControls)

  return (
    <html>
      <Head>
        <script type="module" src="/scripts/bottom-sheet.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data={JSON.stringify(state)}
          x-id="['bottom-sheet']"
          x-bottom-sheet={`{id: $id('bottom-sheet'), ${Object.keys(state)}}`}
        >
          <Nav pathname={event.url.pathname} />

          <main class="bottom-sheet" x-data="{hidden: !$bottomSheet.open}">
            <button x-bottom-sheet:trigger>Open</button>
            <Presence x-bottom-sheet:backdrop x-on:animationstart="(e)=> console.log(e)" />
            <Presence x-bottom-sheet:content x-on:animationstart="(e) => console.log(e)">
              <div x-bottom-sheet:grabber>
                <div x-bottom-sheet:grabber-indicator />
              </div>
              <div x-bottom-sheet:title>Bottom Sheet</div>
              <div data-no-drag="true">No drag area</div>
              <div class="scrollable">
                {Array.from({ length: 100 }).map((_element, index) => (
                  <div>Item {index}</div>
                ))}
              </div>
            </Presence>
          </main>

          <Toolbar>
            <Controls config={bottomSheetControls} state={state} slot="controls" />
            <StateVisualizer
              label="bottom-sheet"
              context={["dragOffset", "activeSnapPoint", "resolvedActiveSnapPoint"]}
            />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
