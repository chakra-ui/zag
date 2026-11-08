import * as radio from "@zag-js/radio-group"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { shippingOptions } from "@zag-js/shared"
import { useId } from "preact/hooks"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/radio-group.css"

export default function Page() {
  const service = useMachine(radio.machine, {
    id: useId(),
    name: "shipping",
    defaultValue: "standard",
  })

  const api = radio.connect(service, normalizeProps)

  return (
    <>
      <main>
        <div className="shipping-options">
          <p className="hint">Focus a method and use the arrow keys to switch.</p>
          <div {...api.getRootProps()}>
            <span {...api.getLabelProps()}>Shipping method</span>
            {shippingOptions.map((opt) => (
              <label key={opt.id} data-testid={`radio-${opt.id}`} {...api.getItemProps({ value: opt.id })}>
                <div {...api.getItemControlProps({ value: opt.id })} />
                <span {...api.getItemTextProps({ value: opt.id })}>
                  <span className="name">{opt.label}</span>
                  <span className="price">{opt.price}</span>
                  <span className="detail">{opt.delivery}</span>
                </span>
                <input {...api.getItemHiddenInputProps({ value: opt.id })} />
              </label>
            ))}
          </div>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
