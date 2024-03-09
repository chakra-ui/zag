import * as clipboard from "@zag-js/clipboard"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import { HiCheck, HiOutlineClipboard } from "react-icons/hi"

type Props = {
  controls: {
    value: string
    timeout: number
  }
}

export function Clipboard(props: Props) {
  const [state, send] = useMachine(clipboard.machine({ id: useId() }), {
    context: props.controls,
  })

  const api = clipboard.connect(state, send, normalizeProps)

  return (
    <div {...api.rootProps}>
      <label {...api.labelProps}>Copy this link</label>
      <div {...api.controlProps}>
        <input {...api.inputProps} />
        <button {...api.triggerProps}>
          {api.isCopied ? <HiCheck /> : <HiOutlineClipboard />}
        </button>
      </div>
    </div>
  )
}
