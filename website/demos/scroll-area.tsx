import * as scrollArea from "@zag-js/scroll-area"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import styles from "../styles/machines/scroll-area.module.css"

export function ScrollArea() {
  const service = useMachine(scrollArea.machine, {
    id: useId(),
  })

  const api = scrollArea.connect(service, normalizeProps)

  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <div className={styles.Viewport} {...api.getViewportProps()}>
        <div className={styles.Content} {...api.getContentProps()}>
          {Array.from({ length: 50 }).map((_, index) => (
            <div key={index}>Item {index + 1}</div>
          ))}
        </div>
      </div>
      <div className={styles.Scrollbar} {...api.getScrollbarProps()}>
        <div className={styles.Thumb} {...api.getThumbProps()} />
      </div>
    </div>
  )
}
