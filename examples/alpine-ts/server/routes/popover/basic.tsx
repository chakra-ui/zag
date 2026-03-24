import { popoverControls } from "@zag-js/shared"
import { defineHandler } from "nitro/h3"
import { Controls } from "../../components/controls"
import { Head } from "../../components/head"
import { Nav } from "../../components/nav"
import { Presence } from "../../components/presence"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/popover.ts"></script>
      </Head>

      <body>
        <div class="page" x-data="popover" x-popover="{id: $id('popover'), ...context}">
          <Nav currentComponent={event.context.currentComponent as string} />

          <main class="popover">
            <div data-part="root">
              <button data-testid="button-before">Button :before</button>

              <button data-testid="popover-trigger" x-popover:trigger>
                Click me
                <div x-popover:indicator>{">"}</div>
              </button>

              <div x-popover:anchor>anchor</div>

              <template x-teleport="body">
                <div x-popover:positioner>
                  <Presence
                    data-testid="popover-content"
                    class="popover-content"
                    x-popover:content
                    x-data="{get present() {return $popover().open}}"
                  >
                    <div x-popover:arrow>
                      <div x-popover:arrow-tip />
                    </div>
                    <div data-testid="popover-title" x-popover:title>
                      Popover Title
                    </div>
                    <div data-part="body" data-testid="popover-body">
                      <a>Non-focusable Link</a>
                      <a href="#" data-testid="focusable-link">
                        Focusable Link
                      </a>
                      <input data-testid="input" placeholder="input" />
                      <button data-testid="popover-close-button" x-popover:close-trigger>
                        X
                      </button>
                    </div>
                  </Presence>
                </div>
              </template>
              <span data-testid="plain-text">I am just text</span>
              <button data-testid="button-after">Button :after</button>
            </div>
          </main>

          <Toolbar>
            <Controls config={popoverControls} slot="controls" />
            <StateVisualizer label="popover" />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
