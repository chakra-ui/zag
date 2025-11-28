import { defineHandler } from "nitro/h3"
import { Head } from "../components/head"
import { Nav } from "../components/nav"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/async-list.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data
          x-async-list="{
            autoReload: true,
            async load({signal, cursor, filterText}) {
              if (cursor) cursor = cursor.replace(/^http:\/\//i, 'https://')

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
                          if (descriptor.direction === 'descending') {
                            cmp *= -1
                          }
                          return cmp
                        } else {
                          return 1
                        }
                      })
                    : [],
              }
            }
          }"
        >
          <Nav pathname={event.url.pathname} />

          <main class="async-list">
            <span x-text="$asyncList().items.length"></span>
            <input type="text" x-on:change="(e) => $asyncList().setFilterText(e.target.value)" />
            <div>
              <template x-if="$asyncList().loading">
                <p>Loading...</p>
              </template>
              <button x-on:click="$asyncList().reload()">Reload</button>
              <button x-on:click="$asyncList().loadMore()">Load More</button>
              <button x-on:click="$asyncList().sort({column: 'name', direction: 'ascending'})">Sort by name</button>
              <pre x-text="JSON.stringify($asyncList().items, null, 2)"></pre>
            </div>
          </main>

          <Toolbar controls={false}>
            <StateVisualizer label="async-list" context={["cursor", "filterText"]} omit={["items"]} />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
