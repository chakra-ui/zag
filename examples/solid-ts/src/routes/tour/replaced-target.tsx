import { tourReplacedTargetData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import * as tour from "@zag-js/tour"
import { For, Show, createMemo, createSignal, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"

export default function Page() {
  const [replaced, setReplaced] = createSignal(false)

  const service = useMachine(tour.machine, { id: createUniqueId(), steps: tourReplacedTargetData })
  const api = createMemo(() => tour.connect(service, normalizeProps))

  return (
    <>
      <main class="tour">
        <div>
          <button onClick={() => api().start()}>Start Tour</button>
          <button onClick={() => setReplaced(true)}>Replace target</button>

          <div class="steps__container">
            {/* The same target id, carried by one node or the other */}
            <Show when={!replaced()}>
              <h3 id="target">Original target</h3>
            </Show>
            <div class="h-200px" />
            <Show when={replaced()}>
              <h3 id="target">Replacement target</h3>
            </Show>
          </div>
        </div>

        <Show when={api().open && api().step}>
          <Portal>
            <Show when={api().step?.backdrop}>
              <div {...api().getBackdropProps()} />
            </Show>
            <div {...api().getSpotlightProps()} />
            <div {...api().getPositionerProps()}>
              <div {...api().getContentProps()}>
                <Show when={api().step?.arrow}>
                  <div {...api().getArrowProps()}>
                    <div {...api().getArrowTipProps()} />
                  </div>
                </Show>

                <p {...api().getTitleProps()}>{api().step?.title}</p>
                <div {...api().getDescriptionProps()}>{api().step?.description}</div>

                <div class="tour button__group">
                  <For each={api().step?.actions}>
                    {(action) => <button {...api().getActionTriggerProps({ action })}>{action.label}</button>}
                  </For>
                </div>
              </div>
            </div>
          </Portal>
        </Show>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
