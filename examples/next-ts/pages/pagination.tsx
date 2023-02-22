import * as pagination from "@zag-js/pagination"
import { useMachine, normalizeProps } from "@zag-js/react"
import { visuallyHiddenStyle } from "@zag-js/visually-hidden"
import { paginationControls, paginationData } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(paginationControls)

  const [state, send] = useMachine(
    pagination.machine({
      id: useId(),
      count: paginationData.length,
      onChange: console.log,
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
                <a href="#previous" {...api.prevPageTriggerProps}>
                  Previous <span style={visuallyHiddenStyle}>Page</span>
                </a>
              </li>
              {api.pages.map((page, i) => {
                if (page.type === "page")
                  return (
                    <li key={page.value}>
                      <a href={`#${page.value}`} data-testid={`item-${page.value}`} {...api.getPageTriggerProps(page)}>
                        {page.value}
                      </a>
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
                <a href="#next" {...api.nextPageTriggerProps}>
                  Next <span style={visuallyHiddenStyle}>Page</span>
                </a>
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
