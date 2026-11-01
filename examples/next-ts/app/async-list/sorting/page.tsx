"use client"

import type { SortDescriptor, SortDirection } from "@zag-js/async-list"
import { createCollator } from "@zag-js/i18n-utils"
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon, LoaderCircleIcon } from "lucide-react"
import { useAsyncList } from "@/hooks/use-async-list"
import "@styles/async-list.css"

interface Person {
  name: string
  url: string
  height: string
  mass: string
  birth_year: string
}

const columns: { key: keyof Person; label: string; numeric?: boolean }[] = [
  { key: "name", label: "Name" },
  { key: "height", label: "Height", numeric: true },
  { key: "mass", label: "Mass", numeric: true },
  { key: "birth_year", label: "Birth year" },
]

// `numeric` orders "96" before "172"
const collator = createCollator("en-US", { numeric: true })

const sortIcon = (direction: SortDirection | undefined) =>
  direction === "ascending" ? ArrowUpIcon : direction === "descending" ? ArrowDownIcon : ArrowUpDownIcon

export default function Page() {
  const list = useAsyncList<Person, string, SortDescriptor<Person>>({
    autoReload: true,
    async load({ signal }) {
      const response = await fetch("https://swapi.py4e.com/api/people/", { signal })
      if (!response.ok) throw new Error(`Request failed (${response.status})`)
      const data = await response.json()
      return { items: data.results }
    },
    // Sorts the loaded rows in place, without another request
    sort({ items, sorting }) {
      const sorted = items.slice().sort((a, b) => {
        const order = collator.compare(a[sorting.column], b[sorting.column])
        return sorting.direction === "descending" ? -order : order
      })
      return { items: sorted }
    },
  })

  const toggleSort = (column: keyof Person) => {
    const ascending = list.sorting?.column === column && list.sorting.direction === "ascending"
    list.setSorting({ column, direction: ascending ? "descending" : "ascending" })
  }

  return (
    <main>
      <div className="async-list">
        {list.error ? (
          <div role="alert" className="async-list-status" data-type="error">
            Couldn’t load people.
            <button onClick={() => list.reload()}>Retry</button>
          </div>
        ) : (
          <div className="async-list-table-scroll">
            <table className="async-list-table" aria-busy={list.isLoading}>
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
                {list.items.map((person) => (
                  <tr key={person.url}>
                    <td>{person.name}</td>
                    <td data-numeric>{person.height}</td>
                    <td data-numeric>{person.mass}</td>
                    <td>{person.birth_year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {list.isEmpty && list.isLoading && (
          <div role="status" className="async-list-status">
            <LoaderCircleIcon className="async-list-spinner" /> Loading people…
          </div>
        )}
      </div>
    </main>
  )
}
