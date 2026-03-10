import { splitterControls } from "@zag-js/shared"
import { defineHandler } from "nitro/h3"
import { Controls } from "../../components/controls"
import { Head } from "../../components/head"
import { Nav } from "../../components/nav"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/splitter.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data="splitter"
          x-splitter="{
            id: $id('splitter'),
            panels: [{id: 'a'}, {id: 'b'}, {id: 'c'}],
            ...context,
          }"
        >
          <Nav currentComponent={event.context.currentComponent as string} />

          <main class="splitter">
            <pre x-text="JSON.stringify($splitter().getSizes(), null, 2)" />
            <div x-splitter:root>
              <div x-splitter:panel="{id: 'a'}">
                <p>Left</p>
              </div>
              <div data-testid="trigger-a:b" x-splitter:resize-trigger="{id: 'a:b'}" />
              <div x-splitter:panel="{id: 'b'}">
                <p>Middle</p>
              </div>
              <div data-testid="trigger-b:c" x-splitter:resize-trigger="{id: 'b:c'}" />
              <div x-splitter:panel="{id: 'c'}">
                <p>Right</p>
              </div>
            </div>
          </main>

          <Toolbar>
            <Controls config={splitterControls} slot="controls" />
            <StateVisualizer label="splitter" />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
