import * as asyncList from "@zag-js/async-list"
import { useMachine } from "@zag-js/solid"
import { createMemo } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"

export default function Page() {
  const service = useMachine(
    asyncList.machine as asyncList.Machine<Character, string, asyncList.SortDescriptor<Character>, string>,
    {
      autoReload: true,
      initialFilter: "",
      async load({ signal, cursor, filter }) {
        if (cursor) cursor = cursor.replace(/^http:\/\//i, "https://")

        await new Promise((resolve) => setTimeout(resolve, 1000))
        let res = await fetch(cursor || `https://swapi.py4e.com/api/people/?search=${filter}`, { signal })
        let json = await res.json()

        return {
          items: json.results,
          cursor: json.next,
        }
      },
      sort({ items, sorting }) {
        return {
          items:
            items.length > 0
              ? items.slice().sort((a, b) => {
                  if (sorting.column != null) {
                    let cmp = a[sorting.column] < b[sorting.column] ? -1 : 1
                    if (sorting.direction === "descending") {
                      cmp *= -1
                    }
                    return cmp
                  } else {
                    return 1
                  }
                })
              : [],
        }
      },
    },
  )

  const api = createMemo(() => asyncList.connect(service))

  return (
    <>
      <main class="async-list">
        <span>{api().items.length}</span>
        <input type="text" onInput={(e) => api().setFilter(e.currentTarget.value)} />
        <div>
          {api().isLoading && <p>Loading...</p>}
          <button onClick={() => api().reload()}>Reload</button>
          <button onClick={() => api().loadMore()}>Load More</button>
          <button onClick={() => api().setSorting({ column: "name", direction: "ascending" })}>Sort by name</button>
          <pre>{JSON.stringify(api().items, null, 2)}</pre>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} context={["cursor", "filter"]} omit={["items"]} />
      </Toolbar>
    </>
  )
}

interface Character {
  name: string
  height: string
  mass: string
  hair_color: string
  skin_color: string
  eye_color: string
  birth_year: string
  gender: string
  homeworld: string
  films: string[]
  species: string[]
  vehicles: string[]
  starships: string[]
  created: string
  edited: string
  url: string
}
