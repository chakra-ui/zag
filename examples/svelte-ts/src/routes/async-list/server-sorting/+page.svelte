<script lang="ts">
  import * as asyncList from "@zag-js/async-list"
  import { useMachine } from "@zag-js/svelte"
  import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon, LoaderCircleIcon } from "lucide-svelte"
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

  const list = $derived(asyncList.connect(service))

  const directionOf = (column: keyof Product) => (list.sorting?.column === column ? list.sorting.direction : undefined)

  const toggleSort = (column: keyof Product) => {
    const ascending = directionOf(column) === "ascending"
    list.setSorting({ column, direction: ascending ? "descending" : "ascending" })
  }
</script>

<main>
  <div class="async-list">
    <div class="async-list-toolbar">
      <input
        type="search"
        aria-label="Search products"
        placeholder="Search products…"
        oninput={(event) => list.setFilter(event.currentTarget.value)}
      />
      <span class="async-list-meta">{list.items.length} shown</span>
    </div>

    {#if list.error}
      <div role="alert" class="async-list-status" data-type="error">
        Couldn’t load products.
        <button onclick={() => list.reload()}>Retry</button>
      </div>
    {:else}
      <div class="async-list-table-scroll">
        <table class="async-list-table" aria-busy={list.isLoading && !list.isLoadingMore}>
          <thead>
            <tr>
              {#each columns as column (column.key)}
                {@const Icon = sortIcon(directionOf(column.key))}
                <th aria-sort={directionOf(column.key) ?? "none"} data-numeric={column.numeric || undefined}>
                  <button class="async-list-sort" onclick={() => toggleSort(column.key)}>
                    {column.label}
                    <Icon aria-hidden="true" />
                  </button>
                </th>
              {/each}
            </tr>
          </thead>
          <tbody>
            {#each list.items as product (product.id)}
              <tr>
                <td>{product.title}</td>
                <td>{product.category}</td>
                <td data-numeric>{currency.format(product.price)}</td>
                <td data-numeric>{product.rating.toFixed(1)}</td>
                <td data-numeric>{product.stock}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}

    {#if list.isEmpty && list.isLoading}
      <div role="status" class="async-list-status">
        <LoaderCircleIcon class="async-list-spinner" /> Loading products…
      </div>
    {/if}
    {#if list.isEmpty && !list.isLoading && !list.error}
      <div class="async-list-status">No products found</div>
    {/if}

    {#if list.hasMore}
      <div class="async-list-footer">
        <button disabled={list.isLoading} onclick={() => list.loadMore()}>
          {list.isLoadingMore ? "Loading…" : "Load more"}
        </button>
      </div>
    {/if}
  </div>
</main>
