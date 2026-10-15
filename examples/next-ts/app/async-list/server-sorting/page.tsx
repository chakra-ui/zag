"use client"

import type { SortDescriptor, SortDirection } from "@zag-js/async-list"
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon, LoaderCircleIcon } from "lucide-react"
import { useAsyncList } from "@/hooks/use-async-list"
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

const sortIcon = (direction: SortDirection | undefined) =>
  direction === "ascending" ? ArrowUpIcon : direction === "descending" ? ArrowDownIcon : ArrowUpDownIcon

export default function Page() {
  const list = useAsyncList<Product, string, SortDescriptor<Product>>({
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

  const toggleSort = (column: keyof Product) => {
    const ascending = list.sorting?.column === column && list.sorting.direction === "ascending"
    list.setSorting({ column, direction: ascending ? "descending" : "ascending" })
  }

  return (
    <main>
      <div className="async-list">
        <div className="async-list-toolbar">
          <input
            type="search"
            aria-label="Search products"
            placeholder="Search products…"
            onChange={(event) => list.setFilter(event.currentTarget.value)}
          />
          <span className="async-list-meta">{list.items.length} shown</span>
        </div>

        {list.error ? (
          <div role="alert" className="async-list-status" data-type="error">
            Couldn’t load products.
            <button onClick={() => list.reload()}>Retry</button>
          </div>
        ) : (
          <div className="async-list-table-scroll">
            <table className="async-list-table" aria-busy={list.isLoading && !list.isLoadingMore}>
              <thead>
                <tr>
                  {columns.map((column) => {
                    const direction = list.sorting?.column === column.key ? list.sorting.direction : undefined
                    const Icon = sortIcon(direction)
                    return (
                      <th key={column.key} aria-sort={direction ?? "none"} data-numeric={column.numeric || undefined}>
                        <button className="async-list-sort" onClick={() => toggleSort(column.key)}>
                          {column.label}
                          <Icon aria-hidden />
                        </button>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {list.items.map((product) => (
                  <tr key={product.id}>
                    <td>{product.title}</td>
                    <td>{product.category}</td>
                    <td data-numeric>{currency.format(product.price)}</td>
                    <td data-numeric>{product.rating.toFixed(1)}</td>
                    <td data-numeric>{product.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {list.isEmpty && list.isLoading && (
          <div role="status" className="async-list-status">
            <LoaderCircleIcon className="async-list-spinner" /> Loading products…
          </div>
        )}
        {list.isEmpty && !list.isLoading && !list.error && <div className="async-list-status">No products found</div>}

        {list.hasMore && (
          <div className="async-list-footer">
            <button onClick={() => list.loadMore()} disabled={list.isLoading}>
              {list.isLoadingMore ? "Loading…" : "Load more"}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
