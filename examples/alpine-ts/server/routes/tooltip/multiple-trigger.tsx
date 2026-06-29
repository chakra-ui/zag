import { Info } from "lucide-static"
import { Presence } from "../../components/presence"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { defineHandler } from "nitro"
import { Head } from "../../components/head"
import { Nav } from "../../components/nav"

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/tooltip.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data="{activeProduct: null}"
          x-tooltip="{
            id: $id('tooltip'),
            positioning: {placement: 'right'},
            onTriggerValueChange({ value }) {
              const product = $products.find((p) => `${p.id}` === value) ?? null;
              activeProduct = product;
            },
          }"
        >
          <Nav currentComponent={event.context.currentComponent as string} />

          <main style={{ padding: "40px", fontFamily: "system-ui" }}>
            <section style={{ marginBottom: "40px" }}>
              <h2>Product Catalog</h2>

              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f3f4f6", textAlign: "left" }}>
                    <th style={{ padding: "12px", borderBottom: "2px solid #e5e7eb" }}>Product</th>
                    <th style={{ padding: "12px", borderBottom: "2px solid #e5e7eb" }}>Price</th>
                    <th style={{ padding: "12px", borderBottom: "2px solid #e5e7eb" }}>Stock</th>
                    <th style={{ padding: "12px", borderBottom: "2px solid #e5e7eb" }}>Info</th>
                  </tr>
                </thead>
                <tbody>
                  <template x-for="product in $products" x-bind:key="product.id">
                    <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "12px" }} x-text="product.name"></td>
                      <td style={{ padding: "12px" }} x-text="'$' + product.price"></td>
                      <td style={{ padding: "12px" }} x-text="product.stock + ' units'"></td>
                      <td style={{ padding: "12px" }}>
                        <button x-tooltip:trigger="{value: `${product.id}`}">{html(Info)}</button>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>

              <div style={{ marginTop: "20px", padding: "12px", backgroundColor: "#f9fafb", borderRadius: "6px" }}>
                <strong>Active Trigger:</strong> <div x-text="$tooltip().triggerValue || '-'"></div> <br />
                <strong>Active Product:</strong>
                <div x-text="activeProduct ? `${activeProduct.name} ($${activeProduct.price})` : '-'"></div>
              </div>
            </section>

            <template x-teleport="body">
              <div x-tooltip:positioner>
                <Presence x-tooltip:content x-data="{get present() {return $tooltip().open}}">
                  <template x-if="activeProduct">
                    <div>
                      <strong x-text="activeProduct.name"></strong>
                      <p x-text="activeProduct.description"></p>
                    </div>
                  </template>
                  <template x-if="! activeProduct">
                    <div>No product selected</div>
                  </template>
                </Presence>
              </div>
            </template>
          </main>

          <Toolbar viz>
            <StateVisualizer label="tooltip" context={["triggerValue", "hasPointerMoveOpened"]} />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
