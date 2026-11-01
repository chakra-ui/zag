<script setup lang="ts">
import * as asyncList from "@zag-js/async-list"
import { useMachine } from "@zag-js/vue"
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon, LoaderCircleIcon } from "lucide-vue-next"
import "@styles/async-list.css"

interface Product {
  id: number
  title: string
  category: string
  price: number
  rating: number
  stock: number
}

const columns: { key: keyof Product; label: string; numeric?: boolean }[] = [
  { key: "title", label: "Product" },
  { key: "category", label: "Category" },
  { key: "price", label: "Price", numeric: true },
  { key: "rating", label: "Rating", numeric: true },
  { key: "stock", label: "Stock", numeric: true },
]

const PAGE_SIZE = 10

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })

const sortIcon = (direction: asyncList.SortDirection | undefined) =>
  direction === "ascending" ? ArrowUpIcon : direction === "descending" ? ArrowDownIcon : ArrowUpDownIcon

const service = useMachine(asyncList.machine as asyncList.Machine<Product>, {
  autoReload: true,
  initialFilter: "",
  initialSorting: { column: "title", direction: "ascending" },
  // Keep the table in place while the next sort or search loads
  keepPreviousItems: true,
  // No `sort`, so sorting goes through `load` and the server orders the rows
  async load({ signal, filter, sorting, cursor }) {
    const params = new URLSearchParams({
      q: filter.trim(),
      limit: String(PAGE_SIZE),
      skip: cursor ?? "0",
      select: "title,category,price,rating,stock",
    })
    if (sorting) {
      params.set("sortBy", String(sorting.column))
      params.set("order", sorting.direction === "ascending" ? "asc" : "desc")
    }
    const response = await fetch(`https://dummyjson.com/products/search?${params}`, { signal })
    if (!response.ok) throw new Error(`Request failed (${response.status})`)
    const data = await response.json()
    const next = data.skip + data.products.length
    return { items: data.products, cursor: next < data.total ? String(next) : undefined }
  },
})

const list = computed(() => asyncList.connect(service))

const directionOf = (column: keyof Product) => {
  const sorting = list.value.sorting
  return sorting?.column === column ? sorting.direction : undefined
}

const toggleSort = (column: keyof Product) => {
  const ascending = directionOf(column) === "ascending"
  list.value.setSorting({ column, direction: ascending ? "descending" : "ascending" })
}
</script>

<template>
  <main>
    <div class="async-list">
      <div class="async-list-toolbar">
        <input
          type="search"
          aria-label="Search products"
          placeholder="Search products…"
          @input="list.setFilter(($event.currentTarget as HTMLInputElement).value)"
        />
        <span class="async-list-meta">{{ list.items.length }} shown</span>
      </div>

      <div v-if="list.error" role="alert" class="async-list-status" data-type="error">
        Couldn’t load products.
        <button @click="list.reload()">Retry</button>
      </div>
      <div v-else class="async-list-table-scroll">
        <table class="async-list-table" :aria-busy="list.isLoading && !list.isLoadingMore">
          <thead>
            <tr>
              <th
                v-for="column in columns"
                :key="column.key"
                :aria-sort="directionOf(column.key) ?? 'none'"
                :data-numeric="column.numeric || undefined"
              >
                <button class="async-list-sort" @click="toggleSort(column.key)">
                  {{ column.label }}
                  <component :is="sortIcon(directionOf(column.key))" aria-hidden="true" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in list.items" :key="product.id">
              <td>{{ product.title }}</td>
              <td>{{ product.category }}</td>
              <td data-numeric>{{ currency.format(product.price) }}</td>
              <td data-numeric>{{ product.rating.toFixed(1) }}</td>
              <td data-numeric>{{ product.stock }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="list.isEmpty && list.isLoading" role="status" class="async-list-status">
        <LoaderCircleIcon class="async-list-spinner" /> Loading products…
      </div>
      <div v-if="list.isEmpty && !list.isLoading && !list.error" class="async-list-status">No products found</div>

      <div v-if="list.hasMore" class="async-list-footer">
        <button :disabled="list.isLoading" @click="list.loadMore()">
          {{ list.isLoadingMore ? "Loading…" : "Load more" }}
        </button>
      </div>
    </div>
  </main>
</template>
