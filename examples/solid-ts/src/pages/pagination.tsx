import * as pagination from "@zag-js/pagination"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { visuallyHiddenStyle } from "@zag-js/visually-hidden"
import { createMemo, createUniqueId, For } from "solid-js"
import { paginationControls, paginationData } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(paginationControls)

  const [state, send] = useMachine(
    pagination.machine({
      id: createUniqueId(),
      count: paginationData.length,
      onPageChange: console.log,
    }),
    {
      context: controls.context,
    },
  )

  const api = createMemo(() => pagination.connect(state, send, normalizeProps))

  const data = () => api().slice(paginationData)

  return (
    <>
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
            <For each={data()}>
              {(item) => (
                <tr>
                  <td>{item.id}</td>
                  <td>{item.first_name}</td>
                  <td>{item.last_name}</td>
                  <td>{item.email}</td>
                  <td>{item.phone}</td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
        {api().totalPages > 1 && (
          <nav {...api().rootProps}>
            <ul>
              <li>
                <button {...api().prevTriggerProps}>
                  Previous <span style={visuallyHiddenStyle}>Page</span>
                </button>
              </li>
              <For each={api().pages}>
                {(page, i) => {
                  if (page.type === "page")
                    return (
                      <li>
                        <button data-testid={`item-${page.value}`} {...api().getItemProps(page)}>
                          {page.value}
                        </button>
                      </li>
                    )
                  return (
                    <li>
                      <span {...api().getEllipsisProps({ index: i() })}>&#8230;</span>
                    </li>
                  )
                }}
              </For>
              <li>
                <button {...api().nextTriggerProps}>
                  Next <span style={visuallyHiddenStyle}>Page</span>
                </button>
              </li>
            </ul>
          </nav>
        )}
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
