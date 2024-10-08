import type { WebContext } from "brisa"
import * as accordion from "@zag-js/accordion"
import { normalizeProps, useMachine } from "@zag-js/brisa"
import { accordionControls, accordionData } from "@zag-js/shared"

export default function Counter({}: {}, ctx: WebContext) {
  const { state, useId, derived } = ctx

  const [accState, send] = useMachine(
    ctx,
    accordion.machine({
      id: useId(),
    }),
  )

  const api = accordion.connect(accState.value, send, normalizeProps)
  // const api = derived(() => accordion.connect(accState.value, send, normalizeProps))

  return (
    <>
      <main class="accordion">
        <div {...api.getRootProps()}>
          {accordionData.map((item) => (
            <div key={item.id} {...api.getItemProps({ value: item.id })}>
              <h3>
                <button data-testid={`${item.id}:trigger`} {...api.getItemTriggerProps({ value: item.id })}>
                  {item.label}
                  <div {...api.getItemIndicatorProps({ value: item.id })}>{">"}</div>
                </button>
              </h3>
              <div data-testid={`${item.id}:content`} {...api.getItemContentProps({ value: item.id })}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua.
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
