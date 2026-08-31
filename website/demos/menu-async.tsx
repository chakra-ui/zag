import * as asyncList from "@zag-js/async-list"
import * as infiniteScroll from "@zag-js/infinite-scroll"
import * as menu from "@zag-js/menu"
import { mergeProps, normalizeProps, Portal, useMachine } from "@zag-js/react"
import { useId, useRef } from "react"
import styles from "../styles/machines/menu.module.css"

interface Character {
  name: string
}

interface LoadMoreProps {
  count: number
  hasMore: boolean
  loading: boolean
  onLoadMore: () => void
}

function LoadMore(props: LoadMoreProps) {
  const service = useMachine(infiniteScroll.machine, { id: useId(), ...props })
  const api = infiniteScroll.connect(service, normalizeProps)
  return (
    <li role="presentation">
      <div {...api.getSentinelProps()} />
      <div
        className={styles.Status}
        {...api.getIndicatorProps({ type: "loading" })}
      >
        Loading more…
      </div>
    </li>
  )
}

export function MenuAsync() {
  const hasOpened = useRef(false)

  const listService = useMachine(
    asyncList.machine as asyncList.Machine<Character>,
    {
      autoReload: false,
      async load({ signal, cursor }) {
        if (cursor) cursor = cursor.replace(/^http:\/\//i, "https://")
        await new Promise((resolve) => setTimeout(resolve, 400))
        const res = await fetch(
          cursor || "https://swapi.py4e.com/api/people/",
          { signal },
        )
        const json = await res.json()
        return { items: json.results, cursor: json.next ?? undefined }
      },
    },
  )
  const listApi = asyncList.connect(listService)

  const service = useMachine(menu.machine, {
    id: useId(),
    onOpenChange({ open }) {
      if (open && !hasOpened.current) {
        hasOpened.current = true
        listApi.reload()
      }
    },
  })
  const api = menu.connect(service, normalizeProps)

  const isInitialLoading = listApi.isLoading && listApi.items.length === 0

  return (
    <>
      <button className={styles.Trigger} {...api.getTriggerProps()}>
        Characters
        <span className={styles.Indicator} {...api.getIndicatorProps()}>
          ▾
        </span>
      </button>
      {api.open && (
        <Portal>
          <div {...api.getPositionerProps()}>
            <ul
              className={`${styles.Content} ${styles.ScrollableContent}`}
              {...mergeProps(api.getContentProps(), {
                "aria-label": "Characters",
              })}
            >
              {isInitialLoading && (
                <li className={styles.Status}>
                  <output aria-live="polite">Loading…</output>
                </li>
              )}
              {listApi.error && (
                <li className={styles.Status}>
                  <output>Couldn&apos;t load characters</output>
                </li>
              )}
              {!isInitialLoading && listApi.isEmpty && !listApi.error && (
                <li className={styles.Status}>
                  <output>No characters found</output>
                </li>
              )}
              {listApi.items.map((item) => (
                <li
                  className={styles.Item}
                  key={item.name}
                  {...api.getItemProps({
                    value: item.name,
                    valueText: item.name,
                  })}
                >
                  {item.name}
                </li>
              ))}
              {!isInitialLoading && (
                <LoadMore
                  count={listApi.items.length}
                  hasMore={listApi.hasMore}
                  loading={listApi.isLoading}
                  onLoadMore={() => listApi.loadMore()}
                />
              )}
            </ul>
          </div>
        </Portal>
      )}
    </>
  )
}
