import * as numberInput from "@zag-js/number-input"
import { normalizeProps, useMachine } from "@zag-js/react"
import { BiChevronDown, BiChevronUp } from "react-icons/bi"
import { useId } from "react"
import styles from "../styles/machines/number-input.module.css"

interface NumberInputProps extends Omit<numberInput.Props, "id"> {}

export function NumberInput(props: NumberInputProps) {
  const service = useMachine(numberInput.machine, {
    id: useId(),
    ...props,
  })

  const api = numberInput.connect(service, normalizeProps)

  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <label {...api.getLabelProps()}>Enter number:</label>
      <div className={styles.Control}>
        <input className={styles.Input} {...api.getInputProps()} />
        <div className={styles.Spinners}>
          <button
            className={styles.IncrementTrigger}
            {...api.getIncrementTriggerProps()}
          >
            <BiChevronUp />
          </button>
          <button
            className={styles.DecrementTrigger}
            {...api.getDecrementTriggerProps()}
          >
            <BiChevronDown />
          </button>
        </div>
      </div>
    </div>
  )
}
