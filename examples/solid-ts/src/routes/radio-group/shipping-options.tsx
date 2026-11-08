import * as radio from "@zag-js/radio-group"
import { shippingOptions } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, For } from "solid-js"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/radio-group.css"

export default function Page() {
  const service = useMachine(radio.machine, {
    id: createUniqueId(),
    name: "shipping",
    defaultValue: "standard",
  })

  const api = createMemo(() => radio.connect(service, normalizeProps))

  return (
    <>
      <main>
        <div class="shipping-options">
          <p class="hint">Focus a method and use the arrow keys to switch.</p>
          <div {...api().getRootProps()}>
            <span {...api().getLabelProps()}>Shipping method</span>
            <For each={shippingOptions}>
              {(opt) => (
                <label data-testid={`radio-${opt.id}`} {...api().getItemProps({ value: opt.id })}>
                  <div {...api().getItemControlProps({ value: opt.id })} />
                  <span {...api().getItemTextProps({ value: opt.id })}>
                    <span class="name">{opt.label}</span>
                    <span class="price">{opt.price}</span>
                    <span class="detail">{opt.delivery}</span>
                  </span>
                  <input {...api().getItemHiddenInputProps({ value: opt.id })} />
                </label>
              )}
            </For>
          </div>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
