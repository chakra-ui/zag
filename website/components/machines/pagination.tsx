import { panda } from "styled-system/jsx"
import * as pagination from "@zag-js/pagination"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import { cva } from "styled-system/css"

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
    <panda.div px="2" w="full" display="flex" justifyContent="center">
      {api.totalPages > 1 && (
        <nav {...api.rootProps}>
          <panda.ul
            display="flex"
            flexWrap={{ base: "wrap", md: "nowrap" }}
            gap="1"
            pl="0 !important"
            listStyleType="none"
          >
            <li>
              <a
                className={paginationLink()}
                href="#previous"
                {...api.prevPageTriggerProps}
              >
                &lt; <panda.span srOnly={true}>Previous Page</panda.span>
              </a>
            </li>
            {api.pages.map((page, i) => {
              if (page.type === "page")
                return (
                  <li key={page.value}>
                    <a
                      className={paginationLink()}
                      href={`#${page.value}`}
                      {...api.getPageTriggerProps(page)}
                    >
                      {page.value}
                    </a>
                  </li>
                )
              else
                return (
                  <li key={`ellipsis-${i}`}>
                    <panda.span
                      cursor="default"
                      {...api.getEllipsisProps({ index: i })}
                    >
                      &#8230;
                    </panda.span>
                  </li>
                )
            })}
            <li>
              <a
                className={paginationLink()}
                href="#next"
                {...api.nextPageTriggerProps}
              >
                &gt; <panda.span srOnly={true}>Next Page</panda.span>
              </a>
            </li>
          </panda.ul>
        </nav>
      )}
    </panda.div>
  )
}

const paginationLink = cva({
  base: {
    px: 3,
    h: 8,
    textAlign: "center",
    m: "auto 4px",
    color: "text-bold",
    display: "flex",
    boxSizing: "border-box",
    alignItems: "center",
    letterSpacing: "0.01071em",
    lineHeight: 1.43,
    fontSize: "13px",
    userSelect: "none",
    textDecoration: "none",
    border: "solid 1px",
    borderColor: "border-bold",
    bg: "bg-subtle",

    _hover: {
      bg: "bg-bold",
      cursor: "pointer",
    },
    _focus: {
      outline: "2px solid royalblue",
      outlineOffset: "1px",
    },

    _disabled: {
      opacity: 0.6,
      cursor: "not-allowed",
      background: "none",
    },

    _selected: {
      bg: "green.500",
      color: "white",
    },
  },
})
