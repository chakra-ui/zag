<script lang="ts" setup>
import * as tooltip from "@zag-js/tooltip"
import { normalizeProps, useMachine } from "@zag-js/vue"

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

const activeProduct = ref<Product | null>(null)

const service = useMachine(tooltip.machine, {
  id: useId(),
  positioning: { placement: "right" },
  onTriggerValueChange({ value }) {
    activeProduct.value = products.find((p) => `${p.id}` === value) ?? null
  },
})

const api = computed(() => tooltip.connect(service, normalizeProps))
</script>

<template>
  <main style="padding: 40px">
    <h2>Product Catalog</h2>

    <table style="width: 100%; border-collapse: collapse; margin-top: 20px">
      <thead>
        <tr style="background-color: #f3f4f6; text-align: left">
          <th style="padding: 12px; border-bottom: 2px solid #e5e7eb">Product</th>
          <th style="padding: 12px; border-bottom: 2px solid #e5e7eb">Price</th>
          <th style="padding: 12px; border-bottom: 2px solid #e5e7eb">Stock</th>
          <th style="padding: 12px; border-bottom: 2px solid #e5e7eb">Info</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in products" :key="product.id" style="border-bottom: 1px solid #e5e7eb">
          <td style="padding: 12px">{{ product.name }}</td>
          <td style="padding: 12px">${{ product.price }}</td>
          <td style="padding: 12px">{{ product.stock }} units</td>
          <td style="padding: 12px">
            <button v-bind="api.getTriggerProps({ value: `${product.id}` })">ℹ️</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div style="margin-top: 20px; padding: 12px; background-color: #f9fafb; border-radius: 6px">
      <strong>Active Trigger:</strong> {{ api.triggerValue || "-" }} <br />
      <strong>Active Product:</strong>
      {{ activeProduct ? `${activeProduct.name} ($${activeProduct.price})` : "-" }}
    </div>

    <Teleport to="#teleports">
      <div v-bind="api.getPositionerProps()">
        <Presence v-bind="api.getContentProps()">
          <template v-if="activeProduct">
            <strong>{{ activeProduct.name }}</strong>
            <p>{{ activeProduct.description }}</p>
          </template>
          <div v-else>No product selected</div>
        </Presence>
      </div>
    </Teleport>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
