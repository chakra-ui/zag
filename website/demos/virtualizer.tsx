import { mergeProps, normalizeProps, type PropTypes } from "@zag-js/react"
import { ListVirtualizer } from "@zag-js/virtualizer"
import {
  useCallback,
  useEffect,
  useId,
  useState,
  useSyncExternalStore,
} from "react"
import styles from "../styles/machines/virtualizer.module.css"

const ITEM_COUNT = 10_000
const ITEM_SIZE = 40

const items = Array.from({ length: ITEM_COUNT }, (_, index) => ({
  id: `item-${index}`,
  label: `Item ${index + 1}`,
}))

function useListVirtualizer() {
  const id = useId()
  const [virtualizer] = useState(
    () =>
      new ListVirtualizer<PropTypes>({
        id,
        normalizeProps,
        count: ITEM_COUNT,
        itemSize: ITEM_SIZE,
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
        {...mergeProps(virtualizer.getRootProps(), {
          className: styles.Viewport,
          style: { height: 320 },
        })}
      >
        <div {...virtualizer.getContentProps()}>
          {virtualItems.map((virtualItem) => {
            const item = items[virtualItem.index]
            return (
              <div
                key={virtualItem.key}
                {...mergeProps(virtualizer.getItemProps(virtualItem), {
                  className: `${styles.Item} ${virtualItem.index % 2 ? styles.ItemAlt : ""}`,
                })}
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
