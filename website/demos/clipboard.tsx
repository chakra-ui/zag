import * as clipboard from "@zag-js/clipboard"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import { HiCheck, HiOutlineClipboard } from "react-icons/hi"

interface ClipboardProps extends Omit<clipboard.Props, "id"> {}

export function Clipboard(props: ClipboardProps) {
  const service = useMachine(clipboard.machine, {
    id: useId(),
    ...props,
  })

  const api = clipboard.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>Copy this link</label>
      <div {...api.getControlProps()}>
        <input {...api.getInputProps()} />
        <button {...api.getTriggerProps()}>
          {api.copied ? <HiCheck /> : <HiOutlineClipboard />}
        </button>
      </div>
    </div>
  )
}
