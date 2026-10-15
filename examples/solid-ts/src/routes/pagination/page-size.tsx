import * as pagination from "@zag-js/pagination"
import { paginationData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-solid"
import { createMemo, createUniqueId, For } from "solid-js"
import { ExampleProps } from "~/components/example-props"
import "@styles/pagination.css"

const pageSizes = [5, 10, 20, 50]

const props = { count: paginationData.length, defaultPageSize: 5 }

export default function Page() {
  const selectId = createUniqueId()

  const service = useMachine(pagination.machine, {
    id: createUniqueId(),
    ...props,
  })

  const api = createMemo(() => pagination.connect(service, normalizeProps))

  return (
    <main class="pagination">
      <div class="pagination-layout">
        <table class="pagination-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            <For each={api().slice(paginationData)}>
              {(item) => (
                <tr>
                  <td>{item.id}</td>
                  <td>
                    {item.first_name} {item.last_name}
                  </td>
                  <td>{item.email}</td>
                </tr>
              )}
            </For>
          </tbody>
        </table>

        <div class="pagination-bar">
          <div class="pagination-page-size">
            <label for={selectId}>Rows per page</label>
            <select
              id={selectId}
              value={api().pageSize}
              onChange={(e) => api().setPageSize(Number(e.currentTarget.value))}
            >
              <For each={pageSizes}>{(size) => <option value={size}>{size}</option>}</For>
            </select>
          </div>

          <div class="hstack gap-4">
            {/* pageRange is zero-based and end-exclusive */}
            <span class="pagination-summary">
              {api().pageRange.start + 1}–{api().pageRange.end} of {api().count}
            </span>
            <nav {...api().getRootProps()}>
              <ul>
                <li>
                  <button {...api().getPreviousTriggerProps()}>
                    <ChevronLeftIcon />
                  </button>
                </li>
                <li>
                  <button {...api().getNextTriggerProps()}>
                    <ChevronRightIcon />
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <ExampleProps value={props} />
      </div>
    </main>
  )
}
