import * as pagination from "@zag-js/pagination"
import { normalizeProps, useMachine } from "@zag-js/react"
import { paginationControls, paginationData } from "@zag-js/shared"
import { visuallyHiddenStyle } from "@zag-js/visually-hidden"
import { useId, useState } from "react"
import { Print } from "../components/print"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(paginationControls)
  const [details, setDetails] = useState({} as any)

  const [state, send] = useMachine(
    pagination.machine({
      id: useId(),
      count: paginationData.length,
      onPageChange(details) {
        setDetails(details)
      },
    }),
    {
      context: controls.context,
    },
  )

  const api = pagination.connect(state, send, normalizeProps)

  const data = api.slice(paginationData)

  return (
    <>
      <main className="pagination">
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
            {data.map((item) => {
              return (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.first_name}</td>
                  <td>{item.last_name}</td>
                  <td>{item.email}</td>
                  <td>{item.phone}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {api.totalPages > 1 && (
          <nav {...api.rootProps}>
            <ul>
              <li>
                <button {...api.prevTriggerProps}>
                  Previous <span style={visuallyHiddenStyle}>Page</span>
                </button>
              </li>
              {api.pages.map((page, i) => {
                if (page.type === "page")
                  return (
                    <li key={page.value}>
                      <button data-testid={`item-${page.value}`} {...api.getItemProps(page)}>
                        {page.value}
                      </button>
                    </li>
                  )
                else
                  return (
                    <li key={`ellipsis-${i}`}>
                      <span {...api.getEllipsisProps({ index: i })}>&#8230;</span>
                    </li>
                  )
              })}
              <li>
                <button {...api.nextTriggerProps}>
                  Next <span style={visuallyHiddenStyle}>Page</span>
                </button>
              </li>
            </ul>
          </nav>
        )}

        <Print title="OpenChange Details" value={details} />
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
