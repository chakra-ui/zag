import { scrollAreaControls } from "@zag-js/shared"
import { defineHandler } from "nitro"
import { Controls } from "../../components/controls"
import { Head } from "../../components/head"
import { Nav } from "../../components/nav"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/scroll-area.ts"></script>
      </Head>

      <body>
        <div class="page" x-data="scrollArea" x-scroll-area="{id: $id('scroll-area'), ...context}">
          <Nav currentComponent={event.context.currentComponent as string} />

          <main class="scroll-area">
            <button x-on:click="$scrollArea().scrollToEdge({edge: 'bottom'})">Scroll to bottom</button>
            <div x-scroll-area:root>
              <div x-scroll-area:viewport>
                <div x-scroll-area:content style={{ minWidth: "800px" }}>
                  {Array.from({ length: 100 }).map((_, index) => (
                    <div>{index}</div>
                  ))}
                </div>
              </div>
              <template x-if="$scrollArea().hasOverflowY">
                <div x-scroll-area:scrollbar="{orientation: 'vertical'}">
                  <div x-scroll-area:thumb="{orientation: 'vertical'}" />
                </div>
              </template>
              <template x-if="$scrollArea().hasOverFlowX">
                <div x-scroll-area:scrollbar="{orientation: 'horizontal'}">
                  <div x-scroll-area:thumb="{orientation: 'horizontal'}" />
                </div>
              </template>
            </div>
          </main>

          <Toolbar>
            <Controls config={scrollAreaControls} slot="controls" />
            <StateVisualizer label="scroll-area" />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
