import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import * as tooltip from "@zag-js/tooltip"
import { InfoIcon } from "lucide-react"
import { useId, useState } from "react"
import { Presence } from "../components/presence"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

interface Product {
  id: number
  name: string
  price: number
  stock: number
  description: string
}

const products: Product[] = [
  { id: 1, name: "Laptop", price: 999, stock: 15, description: "High-performance laptop with 16GB RAM and 512GB SSD" },
  { id: 2, name: "Mouse", price: 29, stock: 50, description: "Ergonomic wireless mouse with precision tracking" },
  { id: 3, name: "Keyboard", price: 79, stock: 30, description: "Mechanical keyboard with RGB backlight" },
  { id: 4, name: "Monitor", price: 299, stock: 20, description: "27-inch 4K display with HDR support" },
  { id: 5, name: "Webcam", price: 89, stock: 25, description: "1080p webcam with auto-focus and noise cancellation" },
]

export default function TooltipMultipleTrigger() {
  const [activeProduct, setActiveProduct] = useState<Product | null>(null)

  const service = useMachine(tooltip.machine, {
    id: useId(),
    positioning: { placement: "right" },
    onTriggerValueChange({ value }) {
      const product = products.find((p) => `${p.id}` === value) ?? null
      setActiveProduct(product)
    },
  })

  const api = tooltip.connect(service, normalizeProps)

  return (
    <>
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
              {products.map((product) => (
                <tr key={product.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "12px" }}>{product.name}</td>
                  <td style={{ padding: "12px" }}>${product.price}</td>
                  <td style={{ padding: "12px" }}>{product.stock} units</td>
                  <td style={{ padding: "12px" }}>
                    <button {...api.getTriggerProps({ value: `${product.id}` })}>
                      <InfoIcon size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: "20px", padding: "12px", backgroundColor: "#f9fafb", borderRadius: "6px" }}>
            <strong>Active Trigger:</strong> {api.triggerValue || "-"} <br />
            <strong>Active Product:</strong> {activeProduct ? `${activeProduct.name} ($${activeProduct.price})` : "-"}
          </div>
        </section>

        <Portal>
          <div {...api.getPositionerProps()}>
            <Presence {...api.getContentProps()}>
              {activeProduct ? (
                <div>
                  <strong>{activeProduct.name}</strong>
                  <p>{activeProduct.description}</p>
                </div>
              ) : (
                <div>No product selected</div>
              )}
            </Presence>
          </div>
        </Portal>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} context={["triggerValue", "hasPointerMoveOpened"]} />
      </Toolbar>
    </>
  )
}
