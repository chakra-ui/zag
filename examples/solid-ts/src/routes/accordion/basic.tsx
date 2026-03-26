import styles from "../../../../../shared/src/css/accordion.module.css"
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

  const service = useMachine(accordion.machine, controls.mergeProps({ id: createUniqueId() }))
  const api = createMemo(() => accordion.connect(service, normalizeProps))

  return (
    <>
      <main class="accordion">
        <div {...api().getRootProps()} class={styles.Root}>
          <For each={accordionData}>
            {(item) => (
              <div {...api().getItemProps({ value: item.id })}>
                <h3>
                  <button data-testid={`${item.id}:trigger`} {...api().getItemTriggerProps({ value: item.id })} class={styles.ItemTrigger}>
                    {item.label}
                    <div {...api().getItemIndicatorProps({ value: item.id })} class={styles.ItemIndicator}>
                      <ChevronRight />
                    </div>
                  </button>
                </h3>
                <div data-testid={`${item.id}:content`} {...api().getItemContentProps({ value: item.id })} class={styles.ItemContent}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                  dolore magna aliqua.
                </div>
              </div>
            )}
          </For>
        </div>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
