<script lang="ts">
  import Presence from "$lib/components/presence.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { normalizeProps, portal, useMachine } from "@zag-js/svelte"
  import * as tooltip from "@zag-js/tooltip"

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

  let activeProduct = $state<Product | null>(null)

  const id = $props.id()
  const service = useMachine(tooltip.machine, {
    id,
    positioning: { placement: "right" },
    onTriggerValueChange({ value }) {
      const product = products.find((p) => `${p.id}` === value) ?? null
      activeProduct = product
    },
  })

  const api = $derived(tooltip.connect(service, normalizeProps))
</script>

<main style="padding: 40px; font-family: system-ui;">
  <section style="margin-bottom: 40px;">
    <h2>Product Catalog</h2>

    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
      <thead>
        <tr style="background-color: #f3f4f6; text-align: left;">
          <th style="padding: 12px; border-bottom: 2px solid #e5e7eb;">Product</th>
          <th style="padding: 12px; border-bottom: 2px solid #e5e7eb;">Price</th>
          <th style="padding: 12px; border-bottom: 2px solid #e5e7eb;">Stock</th>
          <th style="padding: 12px; border-bottom: 2px solid #e5e7eb;">Info</th>
        </tr>
      </thead>
      <tbody>
        {#each products as product (product.id)}
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 12px;">{product.name}</td>
            <td style="padding: 12px;">${product.price}</td>
            <td style="padding: 12px;">{product.stock} units</td>
            <td style="padding: 12px;">
              <button {...api.getTriggerProps({ value: `${product.id}` })}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>

    <div
      style="margin-top: 20px; padding: 12px; background-color: #f9fafb; border-radius: 6px;"
    >
      <strong>Active Trigger:</strong> {api.triggerValue || "-"} <br />
      <strong>Active Product:</strong>
      {activeProduct ? `${activeProduct.name} ($${activeProduct.price})` : "-"}
    </div>
  </section>

  {#if api.open}
    <div use:portal {...api.getPositionerProps()}>
      <Presence {...api.getContentProps()}>
        {#if activeProduct}
          <div>
            <strong>{activeProduct.name}</strong>
            <p>{activeProduct.description}</p>
          </div>
        {:else}
          <div>No product selected</div>
        {/if}
      </Presence>
    </div>
  {/if}
</main>

<Toolbar viz>
  <StateVisualizer state={service} context={["triggerValue", "hasPointerMoveOpened"]} />
</Toolbar>
