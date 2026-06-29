import { defineHandler } from "nitro"
import { Presence } from "../../components/presence"
import { Head } from "../../components/head"
import { Nav } from "../../components/nav"

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/popover.ts"></script>
      </Head>

      <body>
        <div class="page" x-data x-popover="{id: $id('popover'), modal: true}">
          <Nav currentComponent={event.context.currentComponent as string} />

          <main class="popover">
            <div data-part="root">
              <button data-testid="button-before">Button :before</button>

              <button data-testid="popover-trigger" x-popover:trigger>
                Sort by
              </button>

              <template x-teleport="body">
                <div x-popover:positioner>
                  <Presence
                    data-testid="popover-content"
                    class="popover-content"
                    x-popover:content
                    x-data="{get present() {return $popover().open}}"
                  >
                    <fieldset style={{ border: "none", padding: 0 }}>
                      <label>
                        <input data-testid="radio-name-asc" type="radio" name="sort" value="name-asc" checked />
                        Name (A to Z)
                      </label>
                      <label>
                        <input data-testid="radio-name-desc" type="radio" name="sort" value="name-desc" /> Name (Z to A)
                      </label>
                      <label>
                        <input data-testid="radio-hours" type="radio" name="sort" value="hours" /> Hours
                      </label>
                    </fieldset>
                  </Presence>
                </div>
              </template>

              <button data-testid="button-after">Button :after</button>
            </div>
          </main>
        </div>
      </body>
    </html>
  )
})
