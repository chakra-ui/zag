import { defineHandler } from "nitro/h3"
import { Head } from "../components/head"
import { Nav } from "../components/nav"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default defineHandler((event) => {
  const id = "tip-1"
  const id2 = "tip-2"

  return (
    <html>
      <Head>
        <script type="module" src="/scripts/tooltip.ts"></script>
      </Head>

      <body>
        <div class="page" x-data {...{ "x-tooltip.1": `{id: '${id}'}`, "x-tooltip.2": `{id: '${id2}'}` }}>
          <Nav pathname={event.url.pathname} />

          <main class="tooltip">
            <div class="root">
              <>
                <button data-testid={`${id}-trigger`} {...{ "x-tooltip:trigger.1": "" }}>
                  Hover me
                </button>
                <template x-if="$tooltip(1).open">
                  <div {...{ "x-tooltip:positioner.1": "" }}>
                    <div class="tooltip-content" data-testid={`${id}-tooltip`} {...{ "x-tooltip:content.1": "" }}>
                      Tooltip
                    </div>
                  </div>
                </template>
              </>
              <button data-testid={`${id2}-trigger`} {...{ "x-tooltip:trigger.2": "" }}>
                Over me
              </button>
              <template x-if="$tooltip(2).open">
                <template x-teleport="body">
                  <div {...{ "x-tooltip:positioner.2": "" }}>
                    <div class="tooltip-content" data-testid={`${id2}-tooltip`} {...{ "x-tooltip:content.2": "" }}>
                      Tooltip 2
                    </div>
                  </div>
                </template>
              </template>
            </div>
          </main>

          <Toolbar controls={false}>
            <StateVisualizer label="tooltip-1" />
            <StateVisualizer label="tooltip-2" />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
