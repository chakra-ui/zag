import { defineHandler } from "nitro/h3"
import { editableControls, getControlDefaults } from "@zag-js/shared"
import { Controls } from "../components/controls"
import { Head } from "../components/head"
import { Nav } from "../components/nav"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default defineHandler((event) => {
  const state = getControlDefaults(editableControls)

  return (
    <html>
      <Head>
        <script type="module" src="/scripts/editable.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data={JSON.stringify(state)}
          x-id="['editable']"
          x-editable={`{id: $id('editable'), defaultValue: 'Hello World', ${Object.keys(state)}}`}
        >
          <Nav pathname={event.url.pathname} />

          <main class="editable">
            <div x-editable:root>
              <div x-editable:area>
                <input data-testid="input" x-editable:input />
                <span data-testid="preview" x-editable:preview />
              </div>
              <div x-editable:control>
                <template x-if="! $editable().editing">
                  <button data-testid="edit-button" x-editable:edit-trigger>
                    Edit
                  </button>
                </template>
                <template x-if="$editable().editing">
                  <div>
                    <button data-testid="save-button" x-editable:submit-trigger>
                      Save
                    </button>
                    <button data-testid="cancel-button" x-editable:cancel-trigger>
                      Cancel
                    </button>
                  </div>
                </template>
              </div>
            </div>
          </main>

          <Toolbar>
            <Controls config={editableControls} state={state} slot="controls" />
            <StateVisualizer label="editable" />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
