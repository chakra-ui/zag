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
        <div class="page" x-data x-id="['dialog']" x-dialog={`{id: $id('dialog')}`}>
          <Nav pathname={event.url.pathname} />

          <main>
            <button x-dialog:trigger> Click me</button>
            <template x-if="$dialog().open" x-teleport="body">
              <div>
                <div x-dialog:backdrop />
                <div x-dialog:positioner>
                  <div x-dialog:content>
                    <h2 x-dialog:title>Edit profile</h2>
                    <p x-dialog:description>Make changes to your profile here. Click save when you are done.</p>
                    <div>
                      <input placeholder="Enter name..." />
                      <button>Save</button>
                    </div>
                    <button x-dialog:close-trigger>Close</button>
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
