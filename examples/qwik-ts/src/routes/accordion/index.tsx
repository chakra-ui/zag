import { $, component$, noSerialize, useStore } from "@builder.io/qwik"

import { useMachine, normalizeProps } from "@zag-js/qwik"
import * as accordion from "@zag-js/accordion"
import { accordionControls, accordionData } from "@zag-js/shared"
import StateVisualizer from "~/components/state-visualizer"
import Toolbar from "~/components/toolbar"

export default component$(() => {
  const [state, send] = useMachine(
    {
      qrl: $(() =>
        noSerialize(
          accordion.machine({
            id: "accordion",
          }),
        ),
      ),
      initialState: noSerialize(accordion.machine({ id: "accordion" }).getState()),
    },
    {
      // context,
    },
  )

  const api = accordion.connect(state.value!, send, normalizeProps)

  return (
    <>
      <main class="accordion">
        <div {...api.getRootProps()}>
          {accordionData.map((item) => (
            <div key={item.id} {...api.getItemProps({ value: item.id })}>
              <h3>
                <button data-testid={`${item.id}:trigger`} {...api.getItemTriggerProps({ value: item.id })}>
                  {item.label}
                  <div {...api.getItemIndicatorProps({ value: item.id })}>{/* <ArrowRight /> */}</div>
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

      <Toolbar>
        <StateVisualizer state={state.value!} />
      </Toolbar>
    </>
  )
})
