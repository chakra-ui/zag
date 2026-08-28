import { defineHandler } from "nitro"
import { Head } from "../../components/head"
import { Nav } from "../../components/nav"
import { Presence } from "../../components/presence"

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/popover.ts"></script>
      </Head>

      <body>
        <div class="page" x-data x-popover="{id: $id('popover'), modal: false, portalled: true}">
          <Nav currentComponent={event.context.currentComponent as string} />

          <main class="popover">
            <div data-part="root">
              <button data-testid="button-before">Button :before</button>

              <button data-testid="popover-trigger" x-popover:trigger>
                Click me
              </button>

              <template x-teleport="body">
                <div x-popover:positioner>
                  <Presence
                    data-testid="popover-content"
                    class="popover-content"
                    x-popover:content
                    x-data="{get present() {return $popover().open}}"
                  >
                    <a href="#" data-testid="focusable-link">
                      Focusable Link
                    </a>
                    <input data-testid="input" placeholder="input" />
                    <button data-testid="popover-close-button" x-popover:close-trigger>
                      X
                    </button>
                  </Presence>
                </div>
              </template>
            </div>
          </main>
        </div>
      </body>
    </html>
  )
})
