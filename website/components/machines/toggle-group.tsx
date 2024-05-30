import { normalizeProps, useMachine } from "@zag-js/react"
import * as toggle from "@zag-js/toggle-group"
import { useId } from "react"
import { RxFontBold, RxFontItalic, RxUnderline } from "react-icons/rx"

type Props = {
  controls: {
    disabled: boolean
    multiple: boolean
  }
}

export function ToggleGroup(props: Props) {
  const [state, send] = useMachine(toggle.machine({ id: useId() }), {
    context: props.controls,
  })

  const api = toggle.connect(state, send, normalizeProps)

  return (
    <div>
      <div {...api.getRootProps()}>
        <button {...api.getItemProps({ value: "bold" })}>
          <RxFontBold />
        </button>
        <button {...api.getItemProps({ value: "italic" })}>
          <RxFontItalic />
        </button>
        <button {...api.getItemProps({ value: "underline" })}>
          <RxUnderline />
        </button>
      </div>
    </div>
  )
}
