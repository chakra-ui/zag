import { tourLateTargetData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import * as tour from "@zag-js/tour"
import { XIcon } from "lucide-solid"
import { For, Show, createMemo, createSignal, createUniqueId } from "solid-js"
import { Portal } from "@solidjs/web"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/tour.css"

export default function Page() {
  const [shown, setShown] = createSignal(false)

  const service = useMachine(tour.machine, { id: createUniqueId(), steps: tourLateTargetData, targetTimeout: 5000 })
  const api = createMemo(() => tour.connect(service, normalizeProps))

  return (
    <>
      <main class="tour">
        <div>
          <button onClick={() => api().start()}>Start Tour</button>
          <button onClick={() => setShown(true)}>Show target</button>

          <div class="steps__container">
            <Show when={shown()}>
              <h3 id="late-target">Target</h3>
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

                <button {...api().getCloseTriggerProps()}>
                  <XIcon />
                </button>
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
