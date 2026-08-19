import { normalizeProps, useMachine } from "@zag-js/react"
import * as toggle from "@zag-js/toggle"
import { useId } from "react"
import { RxFontBold } from "react-icons/rx"
import styles from "../styles/machines/toggle.module.css"

interface ToggleProps extends toggle.Props {}

export function Toggle(props: ToggleProps) {
  const service = useMachine(toggle.machine, {
    id: useId(),
    ...props,
  } as toggle.Props & { id: string })

  const api = toggle.connect(service, normalizeProps)

  return (
    <button className={styles.Root} {...api.getRootProps()} aria-label="Bold">
      <span className={styles.Indicator} {...api.getIndicatorProps()}>
        <RxFontBold />
      </span>
    </button>
  )
}
