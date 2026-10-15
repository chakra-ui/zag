import { normalizeProps, useMachine } from "@zag-js/solid"
import * as steps from "@zag-js/steps"
import { createMemo, createSignal, createUniqueId, Index } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/steps.css"

const items: steps.StepItem[] = [
  { value: "shipping", title: "Shipping" },
  { value: "payment", title: "Payment" },
  { value: "review", title: "Review" },
]

export default function Page() {
  const [value, setValue] = createSignal<string>(items[0].value)
  const [finished, setFinished] = createSignal<string[] | null>(null)

  const service = useMachine(steps.machine, {
    id: createUniqueId(),
    items,
    get value() {
      return value()
    },
    onValueChange(details) {
      if (details.value) setValue(details.value)
    },
    onComplete(details) {
      setFinished(details.completedValues)
    },
  })

  const api = createMemo(() => steps.connect(service, normalizeProps))

  return (
    <>
      <main class="steps">
        <div {...api().getRootProps()}>
          <div {...api().getListProps()}>
            <Index each={items}>
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

          <Index each={items}>
            {(item) => <div {...api().getContentProps({ value: item().value })}>{item().title} content</div>}
          </Index>

          <div {...api().getContentProps({ value: steps.COMPLETE })}>All done 🎉</div>

          <div>
            <button {...api().getPreviousTriggerProps()}>Back</button>
            <button {...api().getNextTriggerProps()}>Next</button>
          </div>
        </div>

        <hr style={{ margin: "2rem 0" }} />

        <p>
          External state: <code>{value() === steps.COMPLETE ? "complete" : value()}</code>, onComplete:{" "}
          <code>{finished() ? finished()!.join(",") : "-"}</code>
        </p>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Index each={items}>
            {(item) => <button onClick={() => setValue(item().value)}>Go to {item().title}</button>}
          </Index>
          <button onClick={() => setValue(steps.COMPLETE)}>Show completed</button>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
