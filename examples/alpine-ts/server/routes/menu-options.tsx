import { defineHandler } from "nitro/h3"
import { menuControls, getControlDefaults } from "@zag-js/shared"
import { Controls } from "../components/controls"
import { Head } from "../components/head"
import { Nav } from "../components/nav"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default defineHandler((event) => {
  const state = getControlDefaults(menuControls)

  return (
    <html>
      <Head>
        <script type="module" src="/scripts/menu.ts"></script>
      </Head>

      <body>
        <div class="page" x-data="{order: '', type: []}" x-menu="{id: $id('menu')}">
          <Nav pathname={event.url.pathname} />

          <main>
            <div>
              <button data-testid="trigger" x-menu:trigger>
                Actions <span x-menu:indicator>▾</span>
              </button>

              <template x-teleport="body">
                <div x-menu:positioner>
                  <div x-menu:content>
                    <template x-data="radios" x-for="item in radios" x-bind:key="item.value">
                      <div x-menu:option-item="item">
                        <span x-menu:item-indicator="item">✅</span>
                        <span x-menu:item-text="item" x-text="item.label"></span>
                      </div>
                    </template>
                    <hr />
                    <template x-data="checkboxes" x-for="item in checkboxes" x-bind:key="item.value">
                      <div x-menu:option-item="item">
                        <span x-menu:item-indicator="item">✅</span>
                        <span x-menu:item-text="item" x-text="item.label"></span>
                      </div>
                    </template>
                  </div>
                </div>
              </template>
            </div>
          </main>

          <Toolbar>
            <Controls config={menuControls} state={state} slot="controls" />
            <StateVisualizer label="menu" />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
