import { normalizeProps, useMachine } from "@zag-js/solid"
import * as tour from "@zag-js/tour"
import { XIcon } from "lucide-solid"
import { For, Show, createMemo, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import "@styles/tour.css"

export default function Page() {
  const service = useMachine(tour.machine, {
    id: createUniqueId(),
    steps,
  })

  const api = createMemo(() => tour.connect(service, normalizeProps))

  return (
    <main>
      <button class="tour-trigger" onClick={() => api().start()}>
        Start Tour
      </button>

      <div data-id="result" style={{ padding: "20px" }}>
        <h3>Result</h3>
        <p>Your input will appear here after the tour.</p>
      </div>

      <div data-id="input" style={{ padding: "20px" }}>
        <input
          type="text"
          placeholder='Type "test" to continue...'
          style={{ border: "1px solid black", padding: "10px" }}
        />
      </div>

      <Show when={api().step && api().open}>
        <Portal>
          <Show when={api().step?.backdrop}>
            <div {...api().getBackdropProps()} />
          </Show>
          <div {...api().getSpotlightProps()} />
          <div {...api().getPositionerProps()}>
            <div {...api().getContentProps()}>
              <button {...api().getCloseTriggerProps()}>
                <XIcon />
              </button>

              <Show when={api().step?.arrow}>
                <div {...api().getArrowProps()}>
                  <div {...api().getArrowTipProps()} />
                </div>
              </Show>

              <div {...api().getProgressTextProps()}>{api().getProgressText()}</div>

              <p {...api().getTitleProps()}>{api().step?.title}</p>
              <div {...api().getDescriptionProps()}>{api().step?.description}</div>

              <Show when={api().step?.actions}>
                {(actions) => (
                  <div style={{ display: "flex", gap: "5px" }}>
                    <For each={actions()}>
                      {(action) => <button {...api().getActionTriggerProps({ action })}>{action.label}</button>}
                    </For>
                  </div>
                )}
              </Show>
            </div>
          </div>
        </Portal>
      </Show>
    </main>
  )
}

const steps: tour.StepDetails[] = [
  {
    type: "dialog",
    id: "start",
    title: "Welcome",
    description: "This tour waits for you to type a value before moving forward.",
    actions: [{ label: "Let's go!", action: "next" }],
  },
  {
    id: "input",
    title: "Type something",
    description: 'Type "test" in the input field to continue to the next step.',
    target: () => document.querySelector<HTMLElement>("[data-id=input]"),
    placement: "bottom",
    effect({ next, show }) {
      show()
      const [promise, cleanup] = tour.waitForElementValue(
        () => document.querySelector<HTMLInputElement>("[data-id=input] input"),
        "test",
        {
          timeout: 10000,
        },
      )
      promise
        .then(() => {
          cleanup()
          next()
        })
        .catch(() => {})
      return cleanup
    },
  },
  {
    id: "result",
    title: "Result",
    description: "Great! You typed the correct value. Here's where your result would appear.",
    target: () => document.querySelector<HTMLElement>("[data-id=result]"),
    placement: "bottom",
    actions: [
      { label: "Previous", action: "previous" },
      { label: "Next", action: "next" },
    ],
  },
  {
    type: "dialog",
    id: "end",
    title: "All done!",
    description: "You've completed the input event tour.",
    actions: [{ label: "Finish", action: "dismiss" }],
  },
]
