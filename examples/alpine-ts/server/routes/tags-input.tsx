import { defineHandler } from "nitro/h3"
import { getControlDefaults, tagsInputControls } from "@zag-js/shared"
import { Controls } from "../components/controls"
import { Head } from "../components/head"
import { Nav } from "../components/nav"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default defineHandler((event) => {
  const state = getControlDefaults(tagsInputControls)

  return (
    <html>
      <Head>
        <script type="module" src="/scripts/tags-input.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data={JSON.stringify(state)}
          x-id="['tags-input']"
          x-tags-input={`{id: $id('tags-input'), defaultValue: ['React', 'Vue'], ${Object.keys(state)}}`}
        >
          <Nav pathname={event.url.pathname} />

          <main class="tags-input">
            <div x-tags-input:root>
              <label x-tags-input:label>Enter frameworks:</label>
              <div x-tags-input:control>
                <template
                  x-for="(value, index) in $tagsInput().value"
                  x-bind:key="$toDashCase(value) + '-tag-' + index"
                >
                  <span x-tags-input:item="{index, value}">
                    <div x-bind:data-testid="$toDashCase(value) + '-tag'" x-tags-input:item-preview="{index, value}">
                      <span
                        x-bind:data-testid="$toDashCase(value) + '-valuetext'"
                        x-tags-input:item-text="{index, value}"
                        x-text="value"
                      ></span>
                      <button
                        x-bind:data-testid="$toDashCase(value) + '-close-button'"
                        x-tags-input:item-delete-trigger="{index, value}"
                      >
                        &#x2715;
                      </button>
                    </div>
                    <input
                      x-bind:data-testid="$toDashCase(value) + '-input'"
                      x-tags-input:item-input="{index, value}"
                    />
                  </span>
                </template>
                <input data-testid="input" placeholder="add tag" x-tags-input:input />
                <button x-tags-input:clear-trigger>X</button>
              </div>
              <input x-tags-input:hidden-input />
            </div>
          </main>

          <Toolbar>
            <Controls config={tagsInputControls} state={state} slot="controls" />
            <StateVisualizer label="tags-input" />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
