<script lang="ts">
  import * as asyncList from "@zag-js/async-list"
  import { useMachine } from "@zag-js/svelte"

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

  const service = useMachine(asyncList.machine as asyncList.Machine<Character, string>, () => ({
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
  }))

  const api = $derived(asyncList.connect(service))
</script>

<main class="async-list">
  <span>{api.items.length}</span>
  <input type="text" oninput={(e) => api.setFilterText(e.currentTarget.value)} />
  <div>
    {#if api.loading}<p>Loading...</p>{/if}
    <button onclick={() => api.reload()}>Reload</button>
    <button onclick={() => api.loadMore()}>Load More</button>
    <button onclick={() => api.sort({ column: "name", direction: "ascending" })}>Sort by name</button>
    <pre>{JSON.stringify(api.items, null, 2)}</pre>
  </div>
</main>
