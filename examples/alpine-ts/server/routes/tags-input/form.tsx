import { tagsInputControls } from "@zag-js/shared"
import { defineHandler } from "nitro"
import { Controls } from "../../components/controls"
import { Head } from "../../components/head"
import { Nav } from "../../components/nav"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/tags-input.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data:controls="tagsInput"
          x-data="{
            submitCount: 0,
            lastSubmit: null,
          }"
          x-tags-input="{
            id: $id('tags-input'),
            name: 'tags',
            defaultValue: ['React', 'Vue'],
            ...context,
          }"
        >
          <Nav currentComponent={event.context.currentComponent as string} />

          <main class="tags-input">
            <form
              x-on:submit="(e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                const value = String(data.get('tags') ?? '');
                submitCount++;
                lastSubmit = value;
              }"
            >
              <div x-tags-input:root>
                <label x-tags-input:label>Enter frameworks:</label>
                <div x-tags-input:control>
                  <template
                    x-for="(value, index) in $tagsInput().value"
                    x-bind:key="`${$toDashCase(value)}-tag-${index}`"
                  >
                    <span x-tags-input:item="{index, value}">
                      <div x-bind:data-testid="`${$toDashCase(value)}-tag`" x-tags-input:item-preview="{index, value}">
                        <span
                          x-bind:data-testid="`${$toDashCase(value)}-valuetext`"
                          x-tags-input:item-text="{index, value}"
                          x-text="value"
                        ></span>
                        <button
                          x-bind:data-testid="`${$toDashCase(value)}-close-button`"
                          x-tags-input:item-delete-trigger="{index, value}"
                        >
                          &#x2715;
                        </button>
                      </div>
                      <input
                        x-bind:data-testid="`${$toDashCase(value)}-input`"
                        x-tags-input:item-input="{index, value}"
                      />
                    </span>
                  </template>
                  <input data-testid="input" placeholder="add tag" x-tags-input:input />
                  <button type="button" x-tags-input:clear-trigger>
                    X
                  </button>
                </div>
                <input x-tags-input:hidden-input />
              </div>

              <div style={{ marginTop: 16 }}>
                <button type="submit">Submit</button>
              </div>
            </form>

            <section style={{ marginTop: 16 }}>
              <strong>submit count:</strong> <span data-testid="submit-count" x-text="submitCount"></span>
              <br />
              <strong>last submitted value:</strong> <span data-testid="last-submit" x-text="lastSubmit ?? '-'"></span>
            </section>
          </main>

          <Toolbar>
            <Controls config={tagsInputControls} slot="controls" />
            <StateVisualizer label="tags-input" />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
