import { normalizeProps, useMachine } from "@zag-js/solid"
import * as steps from "@zag-js/steps"
import { createMemo, createSignal, createUniqueId, For, Index, Show } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/steps.css"

type Usage = "solo" | "team"

export default function Page() {
  const [name, setName] = createSignal("")
  const [usage, setUsage] = createSignal<Usage>("team")

  const items = createMemo<steps.StepItem[]>(() => [
    { value: "profile", title: "Profile", invalid: !name().trim() },
    { value: "usage", title: "Usage" },
    // Only teams invite people, so solo users never see this step
    { value: "invite", title: "Invite team", optional: true, disabled: usage() === "solo" },
    { value: "calendar", title: "Connect calendar", optional: true },
  ])

  const service = useMachine(steps.machine, {
    id: createUniqueId(),
    get items() {
      return items()
    },
  })

  const api = createMemo(() => steps.connect(service, normalizeProps))

  return (
    <>
      <main class="steps">
        <div {...api().getRootProps()}>
          <p>{api().complete ? "All set" : `Step ${api().index + 1} of ${api().count}`}</p>
          <div {...api().getProgressProps()}>
            <div class="steps-progress-fill" />
          </div>

          <div {...api().getListProps()}>
            <Index each={api().items}>
              {(item, index) => {
                const itemState = () => api().getItemState({ value: item().value })
                return (
                  <div {...api().getItemProps({ value: item().value })}>
                    <button {...api().getTriggerProps({ value: item().value })}>
                      <div {...api().getIndicatorProps({ value: item().value })}>
                        {itemState().completed ? "✓" : itemState().skipped ? "–" : index + 1}
                      </div>
                      <span>{item().title}</span>
                    </button>
                    <div {...api().getSeparatorProps({ value: item().value })} />
                  </div>
                )
              }}
            </Index>
          </div>

          <div {...api().getContentProps({ value: "profile" })} class="steps-form">
            <label>
              Your name
              <input value={name()} onInput={(e) => setName(e.currentTarget.value)} />
            </label>
          </div>

          <div {...api().getContentProps({ value: "usage" })} class="steps-form">
            <For each={["solo", "team"] as const}>
              {(option) => (
                <label style={{ "flex-direction": "row" }}>
                  <input type="radio" name="usage" checked={usage() === option} onChange={() => setUsage(option)} />
                  {option === "solo" ? "Just me" : "With my team"}
                </label>
              )}
            </For>
          </div>

          <div {...api().getContentProps({ value: "invite" })} class="steps-form">
            <label>
              Teammate emails
              <textarea placeholder="ada@example.com, alan@example.com" />
            </label>
          </div>

          <div {...api().getContentProps({ value: "calendar" })}>
            <p>Sync your calendar to see meetings next to your tasks.</p>
            <button>Connect Google Calendar</button>
          </div>

          <div {...api().getContentProps({ value: steps.COMPLETE })}>
            <p>Welcome aboard, {name()}!</p>
            <button onClick={() => api().resetStep()}>Start over</button>
          </div>

          <Show when={!api().complete}>
            <div class="steps-actions">
              <button {...api().getPrevTriggerProps()}>Back</button>
              <button {...api().getSkipTriggerProps()}>Do it later</button>
              <button {...api().getNextTriggerProps()}>{api().canComplete ? "Finish" : "Continue"}</button>
            </div>
          </Show>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
