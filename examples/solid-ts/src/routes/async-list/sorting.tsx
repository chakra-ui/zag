import * as asyncList from "@zag-js/async-list"
import { createCollator } from "@zag-js/i18n-utils"
import { useMachine } from "@zag-js/solid"
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon, LoaderCircleIcon } from "lucide-solid"
import { createMemo, For, Show } from "solid-js"
import { Dynamic } from "solid-js/web"
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

const sortIcon = (direction: asyncList.SortDirection | undefined) =>
  direction === "ascending" ? ArrowUpIcon : direction === "descending" ? ArrowDownIcon : ArrowUpDownIcon

export default function Page() {
  const service = useMachine(asyncList.machine as asyncList.Machine<Person>, {
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
  const list = createMemo(() => asyncList.connect(service))

  const directionOf = (column: keyof Person) => {
    const sorting = list().sorting
    return sorting?.column === column ? sorting.direction : undefined
  }

  const toggleSort = (column: keyof Person) => {
    const ascending = directionOf(column) === "ascending"
    list().setSorting({ column, direction: ascending ? "descending" : "ascending" })
  }

  return (
    <main>
      <div class="async-list">
        <Show
          when={!list().error}
          fallback={
            <div role="alert" class="async-list-status" data-type="error">
              Couldn’t load people.
              <button onClick={() => list().reload()}>Retry</button>
            </div>
          }
        >
          <div class="async-list-table-scroll">
            <table class="async-list-table" aria-busy={list().isLoading}>
              <thead>
                <tr>
                  <For each={columns}>
                    {(column) => (
                      <th aria-sort={directionOf(column.key) ?? "none"} data-numeric={column.numeric || undefined}>
                        <button class="async-list-sort" onClick={() => toggleSort(column.key)}>
                          {column.label}
                          <Dynamic component={sortIcon(directionOf(column.key))} aria-hidden />
                        </button>
                      </th>
                    )}
                  </For>
                </tr>
              </thead>
              <tbody>
                <For each={list().items}>
                  {(person) => (
                    <tr>
                      <td>{person.name}</td>
                      <td data-numeric>{person.height}</td>
                      <td data-numeric>{person.mass}</td>
                      <td>{person.birth_year}</td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>
        </Show>

        <Show when={list().isEmpty && list().isLoading}>
          <div role="status" class="async-list-status">
            <LoaderCircleIcon class="async-list-spinner" /> Loading people…
          </div>
        </Show>
      </div>
    </main>
  )
}
