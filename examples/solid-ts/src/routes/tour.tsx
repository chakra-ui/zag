import { tourControls, tourData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import * as tour from "@zag-js/tour"
import { For, Show, createMemo, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import { IFrame } from "~/components/iframe"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"

export default function Page() {
  const controls = useControls(tourControls)

  const service = useMachine(
    tour.machine,
    controls.mergeProps<tour.Props>({
      id: createUniqueId(),
      steps: tourData,
    }),
  )

  const api = createMemo(() => tour.connect(service, normalizeProps))

  return (
    <>
      <main class="tour">
        <div>
          <button onClick={() => api().start()}>Start Tour</button>

          <div class="steps__container">
            <h3 id="step-1">Step 1</h3>
            <div class="overflow__container">
              <div class="h-200px" />
              <h3 id="step-2">Step 2</h3>
              <div class="h-100px" />
            </div>
            <IFrame>
              <h1 id="step-2a">Iframe Content</h1>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua.
              </p>
            </IFrame>
            <h3 id="step-3">Step 3</h3>
            <h3 id="step-4">Step 4</h3>
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
                <p {...api().getTitleProps()}>{api().step!.title}</p>
                <div {...api().getDescriptionProps()}>{api().step!.description}</div>

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

      <Toolbar controls={controls}>
        <StateVisualizer state={service} omit={["steps"]} />
      </Toolbar>
    </>
  )
}
