import * as pagination from "@zag-js/pagination"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import styles from "../../styles/machines/pagination.module.css"
import { Ghost, Log, Row, Stack } from "./shared"

function usePagination(props: Partial<pagination.Props> = {}) {
  const service = useMachine(pagination.machine, {
    id: useId(),
    count: 500,
    ...props,
  })
  return pagination.connect(service, normalizeProps)
}

function View(props: { api: pagination.Api }) {
  const { api } = props
  const Tag = api.type === "link" ? "a" : "button"
  return (
    <nav {...api.getRootProps()}>
      <ul className={styles.List}>
        <li>
          <Tag
            className={styles.PrevTrigger}
            {...api.getPreviousTriggerProps()}
          >
            ‹ <span>Previous Page</span>
          </Tag>
        </li>
        {api.pages.map((page, i) =>
          page.type === "page" ? (
            <li key={page.value}>
              <Tag className={styles.Item} {...api.getItemProps(page)}>
                {page.value}
              </Tag>
            </li>
          ) : (
            <li key={`ellipsis-${i}`}>
              <span
                className={styles.Ellipsis}
                {...api.getEllipsisProps({ index: i })}
              >
                &#8230;
              </span>
            </li>
          ),
        )}
        <li>
          <Tag className={styles.NextTrigger} {...api.getNextTriggerProps()}>
            › <span>Next Page</span>
          </Tag>
        </li>
      </ul>
    </nav>
  )
}

function Range(props: { api: pagination.Api }) {
  const { start, end } = props.api.pageRange
  return (
    <Log
      label={`page ${props.api.page} of ${props.api.totalPages} · rows`}
      value={`${start + 1}–${Math.min(end, props.api.count)}`}
    />
  )
}

export function PaginationControlled() {
  const [page, setPage] = useState(1)
  const api = usePagination({
    pageSize: 20,
    page,
    onPageChange: (details) => setPage(details.page),
  })
  return (
    <Stack>
      <Row>
        <Ghost onClick={() => setPage(1)}>First</Ghost>
        <Ghost onClick={() => setPage(api.totalPages)}>Last</Ghost>
      </Row>
      <View api={api} />
      <Log label="page" value={page} />
    </Stack>
  )
}

export function PaginationPageSize() {
  const [pageSize, setPageSize] = useState(20)
  const api = usePagination({
    pageSize,
    onPageSizeChange: (details) => setPageSize(details.pageSize),
  })
  return (
    <Stack>
      <Row>
        {[10, 20, 50].map((size) => (
          <Ghost
            key={size}
            aria-pressed={pageSize === size}
            onClick={() => setPageSize(size)}
          >
            {size} per page
          </Ghost>
        ))}
      </Row>
      <View api={api} />
      <Range api={api} />
    </Stack>
  )
}

export function PaginationInitial() {
  const api = usePagination({
    defaultPage: 3,
    defaultPageSize: 20,
  })
  return (
    <Stack>
      <View api={api} />
      <Range api={api} />
    </Stack>
  )
}

export function PaginationLinks() {
  const api = usePagination({
    type: "link",
    getPageUrl: (details) =>
      `#products?page=${details.page}&pageSize=${details.pageSize}`,
  })
  return (
    <Stack>
      <View api={api} />
      <Log label="href" value={api.getPageUrl(api.page)} />
    </Stack>
  )
}

export function PaginationSiblings() {
  const api = usePagination({
    defaultPage: 12,
    siblingCount: 2,
    boundaryCount: 2,
  })
  return <View api={api} />
}
