import { defineHandler } from "nitro/deps/h3"
import { Head } from "../components/head"
import { Nav } from "../components/nav"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/menu.ts"></script>
      </Head>

      <body>
        <div class="page" x-data x-menu="{id: $id('menu'), onSelect: console.log}">
          <Nav pathname={event.url.pathname} />

          <main class="context-menu">
            <div x-menu:context-trigger>Right Click here</div>
            <template x-teleport="body">
              <div x-menu:positioner>
                <ul x-menu:content>
                  <li x-menu:item="{value: 'edit'}">Edit</li>
                  <li x-menu:item="{value: 'duplicate'}">Duplicate</li>
                  <li x-menu:item="{value: 'delete'}">Delete</li>
                  <li x-menu:item="{value: 'export'}">Export...</li>
                </ul>
              </div>
            </template>
          </main>

          <Toolbar controls={false}>
            <StateVisualizer label="menu" />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
