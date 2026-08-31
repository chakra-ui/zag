import { ListVirtualizer } from "@zag-js/virtualizer"
import { useCallback, useEffect, useState, useSyncExternalStore } from "react"
import styles from "../styles/machines/virtualizer.module.css"

const ITEM_COUNT = 10_000
const ITEM_SIZE = 40

const items = Array.from({ length: ITEM_COUNT }, (_, index) => ({
  id: `item-${index}`,
  label: `Item ${index + 1}`,
}))

function useListVirtualizer() {
  const [virtualizer] = useState(
    () =>
      new ListVirtualizer({
        count: ITEM_COUNT,
        estimatedSize: () => ITEM_SIZE,
        overscan: 6,
        indexToKey: (index) => items[index].id,
      }),
  )
  useSyncExternalStore(virtualizer.subscribe, virtualizer.getSnapshot, () => 0)

  const ref = useCallback(
    (el: HTMLElement | null) => {
      if (!el) return
      virtualizer.init(el)
    },
    [virtualizer],
  )

  useEffect(() => {
    return () => virtualizer.destroy()
  }, [virtualizer])

  return { virtualizer, ref }
}

export function Virtualizer() {
  const { virtualizer, ref } = useListVirtualizer()
  const virtualItems = virtualizer.getVirtualItems()

  return (
    <div className={styles.Root}>
      <p className={styles.Meta}>
        {ITEM_COUNT.toLocaleString()} items · rendering {virtualItems.length}
      </p>
      <div
        ref={ref}
        className={styles.Viewport}
        onScroll={virtualizer.handleScroll}
        {...virtualizer.getContainerAriaAttrs()}
        tabIndex={0}
        style={{ ...virtualizer.getContainerStyle(), height: 320 }}
      >
        <div style={virtualizer.getContentStyle()}>
          {virtualItems.map((virtualItem) => {
            const item = items[virtualItem.index]
            return (
              <div
                key={virtualItem.key}
                className={`${styles.Item} ${virtualItem.index % 2 ? styles.ItemAlt : ""}`}
                data-index={virtualItem.index}
                {...virtualizer.getItemAriaAttrs(virtualItem.index)}
                style={virtualizer.getItemStyle(virtualItem)}
              >
                {item.label}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
