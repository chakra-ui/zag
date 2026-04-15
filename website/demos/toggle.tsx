import { normalizeProps, useMachine } from "@zag-js/react"
import * as toggle from "@zag-js/toggle"
import { RxFontBold } from "react-icons/rx"
import styles from "../styles/machines/toggle.module.css"

interface ToggleProps extends toggle.Props {}

export function Toggle(props: ToggleProps) {
  const service = useMachine(toggle.machine, props)
  const api = toggle.connect(service, normalizeProps)

  return (
    <div>
      <button className={styles.Root} {...api.getRootProps()}>
        <span {...api.getIndicatorProps()}>
          <RxFontBold />
        </span>
      </button>
    </div>
  )
}
