import { chakra } from "@chakra-ui/system"
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
    <chakra.div px="2" w="full" display="flex" justifyContent="center">
      {api.totalPages > 1 && (
        <nav {...api.rootProps}>
          <chakra.ul
            display="flex"
            flexWrap={{ base: "wrap", md: "nowrap" }}
            gap="1"
            pl="0 !important"
            listStyleType="none"
          >
            <li>
              <PaginationLink href="#previous" {...api.prevTriggerProps}>
                &lt; <chakra.span srOnly>Previous Page</chakra.span>
              </PaginationLink>
            </li>
            {api.pages.map((page, i) => {
              if (page.type === "page")
                return (
                  <li key={page.value}>
                    <PaginationLink
                      href={`#${page.value}`}
                      {...api.getItemProps(page)}
                    >
                      {page.value}
                    </PaginationLink>
                  </li>
                )
              else
                return (
                  <li key={`ellipsis-${i}`}>
                    <chakra.span
                      cursor="default"
                      {...api.getEllipsisProps({ index: i })}
                    >
                      &#8230;
                    </chakra.span>
                  </li>
                )
            })}
            <li>
              <PaginationLink href="#next" {...api.nextTriggerProps}>
                &gt; <chakra.span srOnly>Next Page</chakra.span>
              </PaginationLink>
            </li>
          </chakra.ul>
        </nav>
      )}
    </chakra.div>
  )
}

const PaginationLink = chakra("a", {
  baseStyle: {
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
