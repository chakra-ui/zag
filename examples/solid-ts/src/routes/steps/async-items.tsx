import { normalizeProps, useMachine } from "@zag-js/solid"
import * as steps from "@zag-js/steps"
import { createMemo, createSignal, createUniqueId, Index, onCleanup, onMount, Show } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/steps.css"

const remoteItems: steps.StepItem[] = [
  { value: "profile", title: "Profile" },
  { value: "team", title: "Team" },
  { value: "billing", title: "Billing", optional: true },
  { value: "done", title: "Done" },
]

export default function Page() {
  const [items, setItems] = createSignal<steps.StepItem[]>([])

  onMount(() => {
    const timer = setTimeout(() => setItems(remoteItems), 1500)
    onCleanup(() => clearTimeout(timer))
  })

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
          <Show when={items().length === 0}>
            <p>Loading steps…</p>
          </Show>

          <div {...api().getListProps()}>
            <Index each={items()}>
              {(item, index) => (
                <div {...api().getItemProps({ value: item().value })}>
                  <button {...api().getTriggerProps({ value: item().value })}>
                    <div {...api().getIndicatorProps({ value: item().value })}>{index + 1}</div>
                    <span>{item().title}</span>
                  </button>
                  <div {...api().getSeparatorProps({ value: item().value })} />
                </div>
              )}
            </Index>
          </div>

          <Index each={items()}>
            {(item) => <div {...api().getContentProps({ value: item().value })}>{item().title} content</div>}
          </Index>

          <div {...api().getContentProps({ value: steps.COMPLETE })}>All set 🎉</div>

          <div style={{ display: "flex", gap: "0.5rem", "margin-top": "1rem" }}>
            <button {...api().getPrevTriggerProps()}>Back</button>
            <button {...api().getNextTriggerProps()}>Next</button>
            <button onClick={() => setItems([])}>Clear items</button>
            <button onClick={() => setItems(remoteItems.map((item) => ({ ...item, disabled: true })))}>
              Disable all
            </button>
            <button onClick={() => setItems(remoteItems)}>Restore items</button>
          </div>

          <p style={{ "margin-top": "1rem" }}>
            While no item is navigable the value is <code>{String(api().value)}</code> and navigation is inert. Clearing
            the items mid-flow moves the value to the nearest surviving step instead of throwing.
          </p>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
