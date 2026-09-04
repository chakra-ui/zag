import { defineHandler } from "nitro"
import { Head } from "../../components/head"
import { Nav } from "../../components/nav"

const items = [
  ...Array.from({ length: 20 }, (_, i) => ({ label: `Item ${i}`, value: `item-${i}` })),
  { label: "Zebra", value: "zebra" },
  ...Array.from({ length: 20 }, (_, i) => ({ label: `Item ${i + 20}`, value: `item-${i + 20}` })),
]

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/menu.ts"></script>
      </Head>

      <body>
        <div class="page" x-data x-menu="{id: $id('menu')}">
          <Nav currentComponent={event.context.currentComponent as string} />

          <main style={{ padding: 40 }}>
            <p style={{ marginBottom: 16, color: "#666" }}>
              Use keyboard: open with Enter/Space, then ArrowDown to navigate. The highlighted item should scroll into
              view.
            </p>
            <div>
              <button x-menu:trigger>
                Actions <span x-menu:indicator>▾</span>
              </button>
              <template x-if="$menu().open">
                <div x-menu:positioner>
                  <ul x-menu:content style={{ maxHeight: "200px", overflowY: "auto" }}>
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
