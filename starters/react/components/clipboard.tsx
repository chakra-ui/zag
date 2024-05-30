import * as clipboard from "@zag-js/clipboard"
import { normalizeProps, useMachine } from "@zag-js/react"
import { ClipboardCheck, ClipboardCopyIcon } from "lucide-react"
import { useId } from "react"

interface Props extends Omit<clipboard.Context, "id"> {
  children: React.ReactNode
}

export function Clipboard(props: Props) {
  const { children, ...context } = props

  const [state, send] = useMachine(clipboard.machine({ id: useId() }), {
    context,
  })

  const api = clipboard.connect(state, send, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>Copy this link</label>
      <div {...api.getControlProps()}>
        <input {...api.getInputProps()} />
        <button {...api.getTriggerProps()}>{api.copied ? <ClipboardCheck /> : <ClipboardCopyIcon />}</button>
      </div>
      <div {...api.getIndicatorProps({ copied: true })}>Copied!</div>
      <div {...api.getIndicatorProps({ copied: false })}>Copy</div>
    </div>
  )
}
