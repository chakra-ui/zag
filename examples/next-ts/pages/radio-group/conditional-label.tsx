import * as radio from "@zag-js/radio-group"
import { normalizeProps, useMachine } from "@zag-js/react"
import { radioData } from "@zag-js/shared"
import { useId, useState } from "react"

export default function Page() {
  const [showLabel, setShowLabel] = useState(false)

  const service = useMachine(radio.machine, { id: useId(), name: "fruit" })
  const api = radio.connect(service, normalizeProps)

  return (
    <main className="radio">
      <label>
        <input type="checkbox" checked={showLabel} onChange={(event) => setShowLabel(event.target.checked)} />
        Show label
      </label>

      <div {...api.getRootProps()} aria-label="Fruits">
        {showLabel && <h3 {...api.getLabelProps()}>Favorite fruit</h3>}
        {radioData.map((opt) => (
          <label key={opt.id} {...api.getItemProps({ value: opt.id })}>
            <div {...api.getItemControlProps({ value: opt.id })} />
            <span {...api.getItemTextProps({ value: opt.id })}>{opt.label}</span>
            <input {...api.getItemHiddenInputProps({ value: opt.id })} />
          </label>
        ))}
      </div>
    </main>
  )
}
