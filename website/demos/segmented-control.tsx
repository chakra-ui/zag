import * as radio from "@zag-js/radio-group"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

interface SegmentedControlProps extends Omit<radio.Props, "id"> {}

export function SegmentedControl(props: SegmentedControlProps) {
  const service = useMachine(radio.machine, {
    id: useId(),
    defaultValue: "react",
    orientation: "horizontal",
    ...props,
  })

  const api = radio.connect(service, normalizeProps)

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

const items = [
  { label: "React", value: "react" },
  { label: "Angular", value: "ng" },
  { label: "Vue", value: "vue" },
]
