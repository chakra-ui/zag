import { normalizeProps, useMachine } from "@zag-js/solid"
import * as toggle from "@zag-js/toggle-group"
import { LayoutGridIcon, ListIcon } from "lucide-solid"
import { createMemo, createUniqueId, For, Index } from "solid-js"
import { Dynamic } from "solid-js/web"
import "@styles/toggle-group.css"

const views = [
  { value: "grid", label: "Grid", icon: LayoutGridIcon },
  { value: "list", label: "List", icon: ListIcon },
] as const

export default function Page() {
  const service = useMachine(toggle.machine, {
    id: createUniqueId(),
    defaultValue: ["grid"],
    deselectable: false,
  })

  const api = createMemo(() => toggle.connect(service, normalizeProps))

  return (
    <main class="toggle-group">
      <div class="vstack gap-4">
        <div {...api().getRootProps()} aria-label="View">
          <For each={views}>
            {(view) => (
              <button {...api().getItemProps({ value: view.value })}>
                <Dynamic component={view.icon} />
                {view.label}
              </button>
            )}
          </For>
        </div>

        <div class="toggle-group-items" data-view={api().value[0]}>
          <Index each={Array.from({ length: 6 })}>{() => <div />}</Index>
        </div>
      </div>
    </main>
  )
}
