import * as pagination from "@zag-js/pagination"
import { paginationControls, paginationData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-solid"
import { createMemo, createSignal, createUniqueId, For, Show } from "solid-js"
import { Output } from "~/components/output"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"
import "@styles/pagination.css"

export default function Page() {
  const controls = useControls(paginationControls)
  const [details, setDetails] = createSignal({} as any)

  const service = useMachine(
    pagination.machine,
    controls.mergeProps<pagination.Props>({
      id: createUniqueId(),
      count: paginationData.length,
      onPageChange(details) {
        setDetails(details)
      },
    }),
  )

  const api = createMemo(() => pagination.connect(service, normalizeProps))

  const data = () => api().slice(paginationData)

  return (
    <>
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
              <For each={data()}>
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
            <span class="pagination-summary">
              {api().pageRange.start + 1}–{api().pageRange.end} of {api().count}
            </span>
            <Show when={api().totalPages > 1}>
              <nav {...api().getRootProps()}>
                <ul>
                  <li>
                    <button {...api().getPrevTriggerProps()}>
                      <ChevronLeftIcon />
                    </button>
                  </li>
                  <For each={api().pages}>
                    {(page, i) =>
                      page.type === "page" ? (
                        <li>
                          <button data-testid={`item-${page.value}`} {...api().getItemProps(page)}>
                            {page.value}
                          </button>
                        </li>
                      ) : (
                        <li>
                          <span {...api().getEllipsisProps({ index: i() })}>&#8230;</span>
                        </li>
                      )
                    }
                  </For>
                  <li>
                    <button {...api().getNextTriggerProps()}>
                      <ChevronRightIcon />
                    </button>
                  </li>
                </ul>
              </nav>
            </Show>
          </div>

          <Output label="Page change details" value={details()} data-testid="output" />
        </div>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
