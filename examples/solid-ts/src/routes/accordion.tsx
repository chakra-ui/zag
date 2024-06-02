import * as accordion from "@zag-js/accordion"
import { accordionControls, accordionData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { ChevronRight } from "lucide-solid"
import { For, createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"

export default function Page() {
  const controls = useControls(accordionControls)

  const [state, send] = useMachine(accordion.machine({ id: createUniqueId() }), {
    context: controls.context,
  })

  const api = createMemo(() => accordion.connect(state, send, normalizeProps))

  return (
    <>
      <main class="accordion">
        <div {...api().getRootProps()}>
          <For each={accordionData}>
            {(item) => (
              <div {...api().getItemProps({ value: item.id })}>
                <h3>
                  <button data-testid={`${item.id}:trigger`} {...api().getItemTriggerProps({ value: item.id })}>
                    {item.label}
                    <div {...api().getItemIndicatorProps({ value: item.id })}>
                      <ChevronRight />
                    </div>
                  </button>
                </h3>
                <div data-testid={`${item.id}:content`} {...api().getItemContentProps({ value: item.id })}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                  dolore magna aliqua.
                </div>
              </div>
            )}
          </For>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
