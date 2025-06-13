import * as asyncList from "@zag-js/async-list"
import { useMachine } from "@zag-js/react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default function Page() {
  const service = useMachine(asyncList.machine as asyncList.Machine<Character, string>, {
    autoReload: true,
    async load({ signal, cursor, filterText }) {
      if (cursor) cursor = cursor.replace(/^http:\/\//i, "https://")

      await new Promise((resolve) => setTimeout(resolve, 1000))
      let res = await fetch(cursor || `https://swapi.py4e.com/api/people/?search=${filterText}`, { signal })
      let json = await res.json()

      return {
        items: json.results,
        cursor: json.next,
      }
    },
    sort({ items, descriptor }) {
      return {
        items:
          items.length > 0
            ? items.slice().sort((a, b) => {
                if (descriptor.column != null) {
                  let cmp = a[descriptor.column] < b[descriptor.column] ? -1 : 1
                  if (descriptor.direction === "descending") {
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
  })

  const api = asyncList.connect(service)

  return (
    <>
      <main className="async-list">
        <span>{api.items.length}</span>
        <input type="text" onChange={(e) => api.setFilterText(e.target.value)} />
        <div>
          {api.loading && <p>Loading...</p>}
          <button onClick={() => api.reload()}>Reload</button>
          <button onClick={() => api.loadMore()}>Load More</button>
          <button onClick={() => api.sort({ column: "name", direction: "ascending" })}>Sort by name</button>
          <pre>{JSON.stringify(api.items, null, 2)}</pre>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} context={["cursor", "filterText"]} omit={["items"]} />
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
