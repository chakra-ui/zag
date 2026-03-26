import { normalizeProps, useMachine, Portal } from "@zag-js/react"
import * as tooltip from "@zag-js/tooltip"
import { useId } from "react"
import styles from "../styles/machines/tooltip.module.css"

interface TooltipProps extends Omit<tooltip.Props, "id"> {}

export function Tooltip(props: TooltipProps) {
  const service = useMachine(tooltip.machine, {
    id: useId(),
    ...props,
  })

  const api = tooltip.connect(service, normalizeProps)

  return (
    <>
      <button className={styles.Trigger} {...api.getTriggerProps()}>
        Hover me
      </button>
      <Portal>
        {api.open && (
          <div {...api.getPositionerProps()}>
            <div className={styles.Content} {...api.getContentProps()}>
              <div className={styles.Arrow} {...api.getArrowProps()}>
                <div className={styles.ArrowTip} {...api.getArrowTipProps()} />
              </div>
              Tooltip
            </div>
          </div>
        )}
      </Portal>
    </>
  )
}
