import { defineHandler } from "nitro/h3"
import { getControlDefaults, hoverCardControls } from "@zag-js/shared"
import { Controls } from "../components/controls"
import { Nav } from "../components/nav"
import { Head } from "../components/head"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default defineHandler((event) => {
  const state = getControlDefaults(hoverCardControls)

  return (
    <html>
      <Head>
        <script type="module" src="/scripts/hover-card.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data={JSON.stringify(state)}
          x-id="['hover-card']"
          x-hover-card={`{id: $id('hover-card'), ${Object.keys(state)}}`}
        >
          <Nav pathname={event.url.pathname} />

          <main class="hover-card">
            <div style={{ display: "flex", gap: "50px" }}>
              <a href="https://twitter.com/zag_js" target="_blank" rel="noreferrer" x-hover-card:trigger>
                Twitter
              </a>

              <template x-teleport="body">
                <template x-if="$hoverCard.open">
                  <div x-hover-card:positioner>
                    <div x-hover-card:content>
                      <div x-hover-card:arrow>
                        <div x-hover-card:arrow />
                      </div>
                      Twitter Preview
                      <a href="https://twitter.com/zag_js" target="_blank" rel="noreferrer">
                        Twitter
                      </a>
                    </div>
                  </div>
                </template>
              </template>

              <div data-part="test-text">Test text</div>
            </div>
          </main>

          <Toolbar>
            <Controls config={hoverCardControls} state={state} slot="controls" />
            <StateVisualizer label="hover-card" />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
