import * as radio from "@zag-js/radio-group"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

const items = [
  { label: "React", value: "react" },
  { label: "Angular", value: "ng" },
  { label: "Vue", value: "vue" },
]

type SegmentedControlProps = {
  controls: {
    disabled: boolean
  }
}

export function SegmentedControl(props: SegmentedControlProps) {
  const [state, send] = useMachine(
    radio.machine({ id: useId(), value: "react", orientation: "horizontal" }),
    {
      context: props.controls,
    },
  )

  const api = radio.connect(state, send, normalizeProps)

  return (
    <div className="segmented-control">
      <div {...api.getRootProps()}>
        <div {...api.getIndicatorProps()} />
        {items.map((opt) => (
          <label key={opt.value} {...api.getItemProps({ value: opt.value })}>
            <span {...api.getItemTextProps({ value: opt.value })}>
              {opt.label}
            </span>
            <input {...api.getItemHiddenInputProps({ value: opt.value })} />
          </label>
        ))}
      </div>
    </div>
  )
}
