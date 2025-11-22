import { defineHandler } from "nitro/h3"
import { Head } from "../components/head"
import { Nav } from "../components/nav"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/dialog-nested.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data
          x-id="['dialog-1', 'dialog-2']"
          x-dialog-1="{id: $id('dialog-1')}"
          x-dialog-2="{id: $id('dialog-2')}"
        >
          <Nav pathname={event.url.pathname} />

          <main>
            <div>
              <button x-dialog-1:trigger data-testid="trigger-1">
                Open Dialog
              </button>

              <div style={{ minHeight: "1200px" }} />

              <template x-if="$dialog1.open">
                <div>
                  <div x-dialog-1:backdrop />
                  <div data-testid="positioner-1" x-dialog-1:positioner>
                    <div x-dialog-1:content>
                      <h2 x-dialog-1:title>Edit profile</h2>
                      <p x-dialog-1:description>Make changes to your profile here. Click save when you are done.</p>
                      <button x-dialog-1:close-trigger data-testid="close-1">
                        X
                      </button>
                      <input type="text" placeholder="Enter name..." data-testid="input-1" />
                      <button data-testid="save-button-1">Save Changes</button>

                      <button x-dialog-2:trigger data-testid="trigger-2">
                        Open Nested
                      </button>

                      <template x-if="$dialog2.open">
                        <div>
                          <div x-dialog-2:backdrop />
                          <div data-testid="positioner-2" x-dialog-2:positioner>
                            <div x-dialog-2:content>
                              <h2 x-dialog-2:title>Nested</h2>
                              <button x-dialog-2:close-trigger data-testid="close-2">
                                X
                              </button>
                              <button x-on:click="$dialog1.setOpen(false)" data-testid="special-close">
                                Close Dialog 1
                              </button>
                            </div>
                          </div>
                        </div>
                      </template>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </main>

          <Toolbar controls={false}>
            <StateVisualizer label="dialog-1" />
            <StateVisualizer label="dialog-2" />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
