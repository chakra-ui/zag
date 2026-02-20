import * as pinInput from "@zag-js/pin-input"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import styles from "../styles/machines/pin-input.module.css"

interface PinInputProps extends Omit<pinInput.Props, "id"> {}

export function PinInput(props: PinInputProps) {
  const service = useMachine(pinInput.machine, {
    id: useId(),
    ...props,
  })

  const api = pinInput.connect(service, normalizeProps)

  return (
    <div>
      <div className={styles.Root} {...api.getRootProps()}>
        {[1, 2, 3].map((_, index) => (
          <input
            className={styles.Input}
            key={index}
            {...api.getInputProps({ index })}
          />
        ))}
      </div>
      <button className={styles.ClearButton} onClick={api.clearValue}>
        Clear
      </button>
    </div>
  )
}
