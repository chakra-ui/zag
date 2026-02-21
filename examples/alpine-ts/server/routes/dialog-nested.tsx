import { defineHandler } from "nitro/h3"
import { Head } from "../components/head"
import { Nav } from "../components/nav"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/dialog.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data
          {...{ "x-dialog.parent": "{id: $id('dialog-parent')}", "x-dialog.child": "{id: $id('dialog-child')}" }}
        >
          <Nav pathname={event.url.pathname} />

          <main>
            <div>
              <button {...{ "x-dialog:trigger.parent": "" }} data-testid="trigger-1">
                Open Dialog
              </button>

              <div style={{ minHeight: "1200px" }} />

              <template x-if="$dialog('parent').open">
                <div>
                  <div {...{ "x-dialog:backdrop.parent": "" }} />
                  <div data-testid="positioner-1" {...{ "x-dialog:positioner.parent": "" }}>
                    <div {...{ "x-dialog:content.parent": "" }}>
                      <h2 {...{ "x-dialog:title.parent": "" }}>Edit profile</h2>
                      <p {...{ "x-dialog:description.parent": "" }}>
                        Make changes to your profile here. Click save when you are done.
                      </p>
                      <button {...{ "x-dialog:close-trigger.parent": "" }} data-testid="close-1">
                        X
                      </button>
                      <input type="text" placeholder="Enter name..." data-testid="input-1" />
                      <button data-testid="save-button-1">Save Changes</button>

                      <button {...{ "x-dialog:trigger.child": "" }} data-testid="trigger-2">
                        Open Nested
                      </button>

                      <template x-if="$dialog('child').open">
                        <div>
                          <div {...{ "x-dialog:backdrop.child": "" }} />
                          <div data-testid="positioner-2" {...{ "x-dialog:positioner.child": "" }}>
                            <div {...{ "x-dialog:content.child": "" }}>
                              <h2 {...{ "x-dialog:title.child": "" }}>Nested</h2>
                              <button {...{ "x-dialog:close-trigger.child": "" }} data-testid="close-2">
                                X
                              </button>
                              <button x-on:click="$dialog('parent').setOpen(false)" data-testid="special-close">
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
            <StateVisualizer label="dialog-parent" />
            <StateVisualizer label="dialog-child" />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
