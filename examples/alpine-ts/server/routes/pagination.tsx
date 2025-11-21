import { defineHandler } from "nitro/h3"
import { getControlDefaults, paginationControls } from "@zag-js/shared"
import { Controls } from "../components/controls"
import { Head } from "../components/head"
import { Nav } from "../components/nav"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default defineHandler((event) => {
  const state = getControlDefaults(paginationControls)

  return (
    <html>
      <Head>
        <script type="module" src="/scripts/pagination.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data={JSON.stringify({ ...state, details: {} })}
          x-id="['pagination']"
          x-pagination={`{
            id: $id('pagination'),
            count: $paginationData.length,
            onPageChange(d) {
              details = d
            },
            ${Object.keys(state)}
          }`}
        >
          <Nav pathname={event.url.pathname} />

          <main class="pagination">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>FIRST NAME</th>
                  <th>LAST NAME</th>
                  <th>EMAIL</th>
                  <th>PHONE</th>
                </tr>
              </thead>
              <tbody>
                <template x-for="item in $pagination.slice($paginationData)">
                  <tr>
                    <td x-text="item.id"></td>
                    <td x-text="item.first_name"></td>
                    <td x-text="item.last_name"></td>
                    <td x-text="item.email"></td>
                    <td x-text="item.phone"></td>
                  </tr>
                </template>
              </tbody>
            </table>
            <template x-if="$pagination.totalPages > 1">
              <nav x-pagination:root>
                <ul>
                  <li>
                    <button x-pagination:prev-trigger>Previous</button>
                  </li>
                  <template
                    x-for="(page, i) in $pagination.pages"
                    x-bind:key="page.type === 'page' ? page.value : ('ellipsis-' + i)"
                  >
                    <li>
                      <template x-if="page.type === 'page'">
                        <button
                          x-bind:data-testid="'item-' + page.value"
                          x-pagination:item="page"
                          x-text="page.value"
                        ></button>
                      </template>
                      <template x-if="page.type !== 'page'">
                        <span x-pagination:ellipsis="{index: i}">&#8230;</span>
                      </template>
                    </li>
                  </template>
                  <li>
                    <button x-pagination:next-trigger>Next</button>
                  </li>
                </ul>
              </nav>
            </template>

            <div class="output">
              <p>"OpenChange Details"</p>
              <pre data-testid="output" x-text="JSON.stringify(details, null, 2)"></pre>
            </div>
          </main>

          <Toolbar>
            <Controls config={paginationControls} state={state} slot="controls" />
            <StateVisualizer label="pagination" />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
