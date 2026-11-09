import { normalizeProps, useMachine } from "@zag-js/solid"
import * as tabs from "@zag-js/tabs"
import { createMemo, createUniqueId, For } from "solid-js"
import { Presence } from "../../components/presence"
import "@styles/tabs.css"

const items = [
  { value: "overview", label: "Overview", content: "Workspace stats and activity." },
  { value: "projects", label: "Projects", content: "Milestones and deadlines." },
  { value: "account", label: "Account", content: "Profile and preferences." },
]

export default function Page() {
  const service = useMachine(tabs.machine, {
    id: createUniqueId(),
    defaultValue: "overview",
  })

  const api = createMemo(() => tabs.connect(service, normalizeProps))

  return (
    <main class="tabs">
      <div {...api().getRootProps()} class="animated-tabs">
        <div {...api().getListProps()}>
          <For each={items}>
            {(item) => <button {...api().getTriggerProps({ value: item.value })}>{item.label}</button>}
          </For>
          <div {...api().getIndicatorProps()} />
        </div>
        <div class="animated-tabs__viewport">
          <For each={items}>
            {(item) => (
              <Presence {...api().getContentProps({ value: item.value })} skipAnimationOnMount>
                <p>{item.content}</p>
              </Presence>
            )}
          </For>
        </div>
      </div>
    </main>
  )
}
