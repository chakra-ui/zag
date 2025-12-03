import { defineHandler } from "nitro/h3"
import { floatingPanelControls, getControlDefaults } from "@zag-js/shared"
import { ArrowDownLeft, Maximize2, Minus, X } from "lucide-static"
import { Controls } from "../components/controls"
import { Head } from "../components/head"
import { Nav } from "../components/nav"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default defineHandler((event) => {
  const state = getControlDefaults(floatingPanelControls)

  return (
    <html>
      <Head>
        <script type="module" src="/scripts/floating-panel.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data={JSON.stringify(state)}
          x-id="['floating']"
          x-floating={`{id: $id('floating'), ${Object.keys(state)}}`}
        >
          <Nav pathname={event.url.pathname} />

          <main class="floating-panel">
            <div>
              <button x-floating:trigger>Toggle Panel</button>
              <div x-floating:positioner>
                <div x-floating:content>
                  <div x-floating:drag-trigger>
                    <div x-floating:header>
                      <p x-floating:title>Floating Panel</p>
                      <div x-floating:control>
                        <button x-floating:stage-trigger="{stage: 'minimized'}">{html(Minus)}</button>
                        <button x-floating:stage-trigger="{stage: 'maximized'}">{html(Maximize2)}</button>
                        <button x-floating:stage-trigger="{stage: 'default'}">{html(ArrowDownLeft)}</button>
                        <button x-floating:close-trigger>{html(X)}</button>
                      </div>
                    </div>
                  </div>
                  <div x-floating:body>
                    <p>Some content</p>
                  </div>

                  <div x-floating:resize-trigger="{axis: 'n'}" />
                  <div x-floating:resize-trigger="{axis: 'e'}" />
                  <div x-floating:resize-trigger="{axis: 'w'}" />
                  <div x-floating:resize-trigger="{axis: 's'}" />
                  <div x-floating:resize-trigger="{axis: 'ne'}" />
                  <div x-floating:resize-trigger="{axis: 'se'}" />
                  <div x-floating:resize-trigger="{axis: 'sw'}" />
                  <div x-floating:resize-trigger="{axis: 'nw'}" />
                </div>
              </div>
            </div>
          </main>

          <Toolbar>
            <Controls config={floatingPanelControls} state={state} slot="controls" />
            <StateVisualizer label="floating" />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
