import * as clipboard from "@zag-js/clipboard"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import { HiCheck, HiOutlineClipboard } from "react-icons/hi"
import styles from "../styles/machines/clipboard.module.css"

interface ClipboardProps extends Omit<clipboard.Props, "id"> {}

export function Clipboard(props: ClipboardProps) {
  const service = useMachine(clipboard.machine, {
    id: useId(),
    ...props,
  })

  const api = clipboard.connect(service, normalizeProps)

  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <label className={styles.Label} {...api.getLabelProps()}>
        Copy this link
      </label>
      <div className={styles.Control} {...api.getControlProps()}>
        <input className={styles.Input} {...api.getInputProps()} />
        <button className={styles.Trigger} {...api.getTriggerProps()}>
          {api.copied ? <HiCheck /> : <HiOutlineClipboard />}
        </button>
      </div>
    </div>
  )
}
