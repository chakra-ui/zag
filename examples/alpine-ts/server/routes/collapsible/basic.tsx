import { defineHandler } from "nitro/h3"
import { collapsibleControls } from "@zag-js/shared"
import { ChevronDown } from "lucide-static"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { Head } from "../../components/head"
import { Nav } from "../../components/nav"
import { Controls } from "../../components/controls"

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/collapsible.ts" />
      </Head>

      <body>
        <div class="page" x-data="collapsible" x-collapsible="{id: $id('collapsible'), ...context}">
          <Nav currentComponent={event.context.currentComponent as string} />

          <main class="collapsible">
            <div x-collapsible:root>
              <button x-collapsible:trigger>
                Collapsible Trigger
                <div x-collapsible:indicator>{html(ChevronDown)}</div>
              </button>
              <div x-collapsible:content>
                <p>
                  Lorem dfd dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                  dolore magna sfsd. Ut enim ad minimdfd v eniam, quis nostrud exercitation ullamco laboris nisi ut
                  aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
                  dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
                  officia deserunt mollit anim id est laborum. <a href="#">Some Link</a>
                </p>
              </div>
            </div>

            <div>
              <div>Toggle Controls</div>
              <button x-on:click="() => $collapsible().setOpen(true)">Open</button>
              <button x-on:click="() => $collapsible().setOpen(false)">Close</button>
            </div>
          </main>

          <Toolbar viz>
            <Controls config={collapsibleControls} slot="controls" />
            <StateVisualizer label="collapsible" omit={["stylesRef"]} />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
