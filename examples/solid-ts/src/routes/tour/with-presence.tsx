import { tourControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import * as tour from "@zag-js/tour"
import { X } from "lucide-solid"
import { For, Show, createMemo, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import { Presence } from "~/components/presence"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"
import "@styles/tour.css"

const steps: tour.StepDetails[] = [
  {
    type: "dialog",
    id: "intro",
    title: "Welcome",
    description: "This tour uses Presence so content stays mounted during the exit animation.",
    actions: [{ label: "Next", action: "next" }],
  },
  {
    type: "tooltip",
    id: "search",
    title: "Search",
    description: "Find anything from here.",
    target: () => document.querySelector<HTMLElement>("#tour-search"),
    actions: [
      { label: "Previous", action: "previous" },
      { label: "Next", action: "next" },
    ],
  },
  {
    type: "tooltip",
    id: "profile",
    title: "Profile",
    description: "Finish here to watch the tooltip exit animation.",
    target: () => document.querySelector<HTMLElement>("#tour-profile"),
    actions: [
      { label: "Previous", action: "previous" },
      { label: "Finish", action: "dismiss" },
    ],
  },
]

export default function Page() {
  const controls = useControls(tourControls)

  const service = useMachine(
    tour.machine,
    controls.mergeProps<tour.Props>({
      id: createUniqueId(),
      steps,
    }),
  )

  const api = createMemo(() => tour.connect(service, normalizeProps))

  return (
    <>
      <main class="tour">
        <div>
          <button onClick={() => api().start()}>Start Tour</button>
          <pre data-testid="tour-debug" style={{ "margin-top": "12px", "font-size": "12px" }}>
            open={String(api().open)} stepId={api().step?.id ?? "null"} title={api().step?.title ?? "(empty)"}
          </pre>
          <div style={{ display: "flex", gap: "16px", "margin-top": "24px" }}>
            <button id="tour-search" type="button">
              Search
            </button>
            <button id="tour-profile" type="button">
              Profile
            </button>
          </div>
        </div>

        <Portal>
          <Presence {...api().getBackdropProps()} lazyMount unmountOnExit />
          <Presence {...api().getSpotlightProps()} lazyMount unmountOnExit />
          <div {...api().getPositionerProps()}>
            <Presence {...api().getContentProps()} lazyMount unmountOnExit>
              <Show
                when={api().step}
                fallback={
                  <p data-testid="step-cleared-during-exit" style={{ color: "crimson", "font-weight": "700" }}>
                    STEP CLEARED DURING EXIT (bug)
                  </p>
                }
              >
                {(step) => (
                  <>
                    <Show when={step().arrow}>
                      <div {...api().getArrowProps()}>
                        <div {...api().getArrowTipProps()} />
                      </div>
                    </Show>

                    <p {...api().getTitleProps()}>{step().title}</p>
                    <div {...api().getDescriptionProps()}>{step().description}</div>
                    <div {...api().getProgressTextProps()}>{api().getProgressText()}</div>

                    <Show when={step().actions}>
                      {(actions) => (
                        <div class="tour button__group">
                          <For each={actions()}>
                            {(action) => <button {...api().getActionTriggerProps({ action })}>{action.label}</button>}
                          </For>
                        </div>
                      )}
                    </Show>

                    <button {...api().getCloseTriggerProps()}>
                      <X />
                    </button>
                  </>
                )}
              </Show>
            </Presence>
          </div>
        </Portal>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} omit={["steps"]} />
      </Toolbar>
    </>
  )
}
