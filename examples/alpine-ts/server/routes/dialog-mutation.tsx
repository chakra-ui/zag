import { defineHandler } from "nitro/h3"
import { Head } from "../components/head"
import { Nav } from "../components/nav"

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/dialog.ts"></script>
      </Head>

      <body>
        <div class="page" x-data="{nextContent: false}" x-id="['dialog']" x-dialog="{id: $id('dialog')}">
          <Nav pathname={event.url.pathname} />

          <main>
            <button x-dialog:trigger> Click me</button>
            <template x-teleport="body">
              <div>
                <div x-dialog:backdrop />
                <div x-dialog:positioner>
                  <div x-dialog:content>
                    <template x-if="! nextContent">
                      <button x-on:click="nextContent = true">Set next content</button>
                    </template>
                    <template x-if="nextContent">
                      <button x-on:click="nextContent = false">Set previous content</button>
                    </template>
                  </div>
                </div>
              </div>
            </template>
          </main>
        </div>
      </body>
    </html>
  )
})
