import * as pagination from "@zag-js/pagination"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import styles from "../styles/machines/pagination.module.css"

interface PaginationProps extends Omit<pagination.Props, "id"> {}

export function Pagination(props: PaginationProps) {
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
          <ul className={styles.List} role="pagination">
            <li>
              <a
                className={styles.PrevTrigger}
                href="#previous"
                {...api.getPrevTriggerProps()}
              >
                &lt; <span>Previous Page</span>
              </a>
            </li>
            {api.pages.map((page, i) => {
              if (page.type === "page")
                return (
                  <li key={page.value}>
                    <a
                      className={styles.Item}
                      href={`#${page.value}`}
                      {...api.getItemProps(page)}
                    >
                      {page.value}
                    </a>
                  </li>
                )
              else
                return (
                  <li key={`ellipsis-${i}`}>
                    <span
                      className={styles.Ellipsis}
                      {...api.getEllipsisProps({ index: i })}
                    >
                      &#8230;
                    </span>
                  </li>
                )
            })}
            <li>
              <a
                className={styles.NextTrigger}
                href="#next"
                {...api.getNextTriggerProps()}
              >
                &gt; <span>Next Page</span>
              </a>
            </li>
          </ul>
        </nav>
      )}
    </>
  )
}
