import { normalizeProps, useMachine } from "@zag-js/solid"
import * as tour from "@zag-js/tour"
import { X } from "lucide-solid"
import { For, Show, createMemo, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/tour.css"

const steps: tour.StepDetails[] = [
  {
    id: "choose",
    type: "dialog",
    title: "Choose Your Path",
    description: "Are you new here or a returning user?",
    actions: [
      {
        label: "I'm new",
        action: (actionMap) => actionMap.goto("beginner"),
      },
      {
        label: "I know the basics",
        action: (actionMap) => actionMap.goto("advanced"),
      },
    ],
  },
  {
    id: "beginner",
    type: "tooltip",
    target: () => document.querySelector<HTMLElement>("#option-beginner"),
    title: "Welcome!",
    description: "We'll start with the fundamentals to get you up and running.",
    actions: [{ label: "Next", action: "next" }],
  },
  {
    id: "basics",
    type: "tooltip",
    target: () => document.querySelector<HTMLElement>("#feature-basics"),
    title: "Getting Started",
    description: "Create your first project and invite your team.",
    actions: [
      { label: "Prev", action: "prev" },
      { label: "Done", action: "dismiss" },
    ],
  },
  {
    id: "advanced",
    type: "tooltip",
    target: () => document.querySelector<HTMLElement>("#option-advanced"),
    title: "Welcome Back!",
    description: "Let's skip the basics and show you what's new.",
    actions: [{ label: "Next", action: "next" }],
  },
  {
    id: "power",
    type: "tooltip",
    target: () => document.querySelector<HTMLElement>("#feature-power"),
    title: "Power Features",
    description: "Set up automations, API keys, and custom workflows.",
    actions: [
      { label: "Prev", action: "prev" },
      { label: "Done", action: "dismiss" },
    ],
  },
]

export default function Page() {
  const service = useMachine(tour.machine, {
    id: createUniqueId(),
    steps,
  })

  const api = createMemo(() => tour.connect(service, normalizeProps))

  return (
    <>
      <main class="tour">
        <div>
          <button onClick={() => api().start()}>Start Tour</button>
          <div class="steps__container">
            <div id="option-beginner" class="tour-card">
              <h4>Beginner</h4>
              <p>New to the platform? Start here.</p>
            </div>
            <div id="option-advanced" class="tour-card">
              <h4>Advanced</h4>
              <p>Already familiar? Jump to power features.</p>
            </div>
            <div style={{ display: "flex", gap: "1rem" }}>
              <div id="feature-basics" class="tour-card">
                <h4>Getting Started</h4>
                <p>Create your first project.</p>
              </div>
              <div id="feature-power" class="tour-card">
                <h4>Power Features</h4>
                <p>Automations and API access.</p>
              </div>
            </div>
          </div>
        </div>

        <Show when={api().step && api().open}>
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
                <div {...api().getProgressTextProps()}>{api().getProgressText()}</div>

                <Show when={api().step?.actions}>
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
              </div>
            </div>
          </Portal>
        </Show>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} omit={["steps"]} />
      </Toolbar>
    </>
  )
}
