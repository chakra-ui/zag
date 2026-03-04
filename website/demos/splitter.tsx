import { normalizeProps, useMachine } from "@zag-js/react"
import * as splitter from "@zag-js/splitter"
import { useId } from "react"
import styles from "../styles/machines/splitter.module.css"

interface SplitterProps extends Omit<splitter.Props, "id" | "panels"> {}

export function Splitter(props: SplitterProps) {
  const service = useMachine(splitter.machine, {
    id: useId(),
    panels: [{ id: "a" }, { id: "b" }],
    defaultSize: [50, 50],
    ...props,
  })

  const api = splitter.connect(service, normalizeProps)

  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <div className={styles.Panel} {...api.getPanelProps({ id: "a" })}>
        <p>A</p>
      </div>
      <div
        className={styles.ResizeTrigger}
        {...api.getResizeTriggerProps({ id: "a:b" })}
      />
      <div className={styles.Panel} {...api.getPanelProps({ id: "b" })}>
        <p>B</p>
      </div>
    </div>
  )
}
