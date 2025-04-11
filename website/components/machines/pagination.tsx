import * as pagination from "@zag-js/pagination"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

export function Pagination(props: Omit<pagination.Props, "id">) {
  const service = useMachine(pagination.machine, {
    id: useId(),
    count: 1000,
    ...props,
  })

  const api = pagination.connect(service, normalizeProps)

  return (
    <>
      {api.totalPages > 1 && (
        <nav {...api.getRootProps()}>
          <ul role="pagination">
            <li>
              <a href="#previous" {...api.getPrevTriggerProps()}>
                &lt; <span>Previous Page</span>
              </a>
            </li>
            {api.pages.map((page, i) => {
              if (page.type === "page")
                return (
                  <li key={page.value}>
                    <a href={`#${page.value}`} {...api.getItemProps(page)}>
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
              <a href="#next" {...api.getNextTriggerProps()}>
                &gt; <span>Next Page</span>
              </a>
            </li>
          </ul>
        </nav>
      )}
    </>
  )
}
