import type { WebContext } from "brisa"
import * as accordion from "@zag-js/accordion"
import { normalizeProps, useMachine } from "@zag-js/brisa"
import { accordionControls, accordionData } from "@zag-js/shared"

export default function Counter({}: {}, ctx: WebContext) {
  const { useId, derived } = ctx

  const [accState, send] = useMachine(
    ctx,
    accordion.machine({
      id: useId(),
    }),
  )

  const api = derived(() => accordion.connect(accState.value, send, normalizeProps))

  return (
    <>
      <main class="accordion">
        <div {...api.value.getRootProps()}>
          {accordionData.map((item) => (
            <div key={item.id} {...api.value.getItemProps({ value: item.id })}>
              <h3>
                <button data-testid={`${item.id}:trigger`} {...api.value.getItemTriggerProps({ value: item.id })}>
                  {item.label}
                  <div {...api.value.getItemIndicatorProps({ value: item.id })}>{">"}</div>
                </button>
              </h3>
              <div data-testid={`${item.id}:content`} {...api.value.getItemContentProps({ value: item.id })}>
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
