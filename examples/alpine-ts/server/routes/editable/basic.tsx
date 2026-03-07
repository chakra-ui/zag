import { defineHandler } from "nitro/h3"
import { editableControls } from "@zag-js/shared"
import { Controls } from "../../components/controls"
import { Head } from "../../components/head"
import { Nav } from "../../components/nav"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/editable.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data="editable"
          x-id="['editable']"
          x-editable="{id: $id('editable'), defaultValue: 'Hello World', ...context}"
        >
          <Nav currentComponent={event.context.currentComponent as string} />

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
            <Controls config={editableControls} slot="controls" />
            <StateVisualizer label="editable" />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
