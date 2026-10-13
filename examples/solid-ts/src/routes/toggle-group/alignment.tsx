import { normalizeProps, useMachine } from "@zag-js/solid"
import * as toggle from "@zag-js/toggle-group"
import { AlignCenterIcon, AlignJustifyIcon, AlignLeftIcon, AlignRightIcon } from "lucide-solid"
import { createMemo, createUniqueId, For } from "solid-js"
import { Dynamic } from "solid-js/web"
import "@styles/toggle-group.css"

const options = [
  { value: "left", label: "Align left", icon: AlignLeftIcon },
  { value: "center", label: "Align center", icon: AlignCenterIcon },
  { value: "right", label: "Align right", icon: AlignRightIcon },
  { value: "justify", label: "Justify", icon: AlignJustifyIcon },
] as const

export default function Page() {
  const service = useMachine(toggle.machine, {
    id: createUniqueId(),
    defaultValue: ["left"],
    // Single choice that can't be cleared, like a radio group
    deselectable: false,
  })

  const api = createMemo(() => toggle.connect(service, normalizeProps))

  return (
    <main class="toggle-group">
      <div class="vstack gap-4">
        <div {...api().getRootProps()} aria-label="Text alignment">
          <For each={options}>
            {(option) => (
              <button {...api().getItemProps({ value: option.value })} aria-label={option.label} title={option.label}>
                <Dynamic component={option.icon} />
              </button>
            )}
          </For>
        </div>

        <p class="toggle-group-preview" style={{ "text-align": api().value[0] as "left" }}>
          Zag machines handle the behavior; you bring the markup and styles. This paragraph follows the selected
          alignment.
        </p>
      </div>
    </main>
  )
}
