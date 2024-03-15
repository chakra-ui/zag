import * as pagination from "@zag-js/pagination"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

type PaginationProps = {
  controls: {
    pageSize: number
    siblingCount: number
  }
}

export function Pagination(props: PaginationProps) {
  const [state, send] = useMachine(
    pagination.machine({
      id: useId(),
      count: 1000,
    }),

    {
      context: props.controls,
    },
  )

  const api = pagination.connect(state, send, normalizeProps)

  return (
    <>
      {api.totalPages > 1 && (
        <nav {...api.rootProps}>
          <ul role="pagination">
            <li>
              <a href="#previous" {...api.prevTriggerProps}>
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
              <a href="#next" {...api.nextTriggerProps}>
                &gt; <span>Next Page</span>
              </a>
            </li>
          </ul>
        </nav>
      )}
    </>
  )
}
