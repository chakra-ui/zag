import * as radio from "@zag-js/radio-group"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { alignOptions } from "@zag-js/shared"
import { useId } from "preact/hooks"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/segmented-control.css"
import "@styles/radio-group.css"

export default function Page() {
  const service = useMachine(radio.machine, {
    id: useId(),
    name: "align",
    orientation: "horizontal",
    defaultValue: "left",
  })

  const api = radio.connect(service, normalizeProps)

  return (
    <>
      <main>
        <div className="segmented-control icon-only">
          <p className="hint">Pick an alignment, or focus one and press the arrow keys.</p>
          <div {...api.getRootProps()}>
            <span {...api.getLabelProps()}>Text alignment</span>
            <div {...api.getIndicatorProps()} />
            {alignOptions.map((opt) => (
              <label key={opt.id} data-testid={`radio-${opt.id}`} {...api.getItemProps({ value: opt.id })}>
                <span aria-label={opt.label} {...api.getItemTextProps({ value: opt.id })}>
                  <svg viewBox="0 0 20 20" aria-hidden="true">
                    <path d={opt.icon} />
                  </svg>
                </span>
                <input {...api.getItemHiddenInputProps({ value: opt.id })} />
              </label>
            ))}
          </div>
          <p className="preview" data-testid="preview" data-align={api.value}>
            Orders placed before 3pm ship the same day. Delivery windows are estimates and may change during peak
            periods.
          </p>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
