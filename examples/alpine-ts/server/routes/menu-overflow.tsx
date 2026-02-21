import { defineHandler } from "nitro/h3"
import { Head } from "../components/head"
import { Nav } from "../components/nav"

const items = Array.from({ length: 40 }, (_, i) => ({
  label: `Item ${i}`,
  value: `item-${i}`,
}))

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/menu.ts"></script>
      </Head>

      <body>
        <div class="page" x-data x-menu="{id: $id('menu')}">
          <Nav pathname={event.url.pathname} />

          <main>
            <div>
              <button x-menu:trigger>
                Actions <span x-menu:indicator>▾</span>
              </button>
              <template x-if="$menu().open">
                <div x-menu:positioner>
                  <ul x-menu:content style={{ maxHeight: "300px", overflowY: "auto" }}>
                    {items.map((item) => (
                      <li x-menu:item={`{value: '${item.value}'}`}>{item.label}</li>
                    ))}
                  </ul>
                </div>
              </template>
            </div>
          </main>
        </div>
      </body>
    </html>
  )
})
