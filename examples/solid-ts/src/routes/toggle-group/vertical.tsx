import { normalizeProps, useMachine } from "@zag-js/solid"
import * as toggle from "@zag-js/toggle-group"
import { EraserIcon, HandIcon, MousePointer2Icon, PencilIcon, SquareIcon } from "lucide-solid"
import { createMemo, createUniqueId, For } from "solid-js"
import { Dynamic } from "solid-js/web"
import "@styles/toggle-group.css"

const tools = [
  { value: "select", label: "Select", icon: MousePointer2Icon },
  { value: "hand", label: "Hand", icon: HandIcon },
  { value: "pencil", label: "Pencil", icon: PencilIcon },
  { value: "shape", label: "Shape", icon: SquareIcon },
  { value: "eraser", label: "Eraser", icon: EraserIcon },
] as const

export default function Page() {
  const service = useMachine(toggle.machine, {
    id: createUniqueId(),
    orientation: "vertical",
    defaultValue: ["select"],
    deselectable: false,
  })

  const api = createMemo(() => toggle.connect(service, normalizeProps))

  return (
    <main class="toggle-group">
      <div class="hstack gap-4 items-start">
        {/* Arrow up/down move focus in a vertical group */}
        <div {...api().getRootProps()} aria-label="Tools">
          <For each={tools}>
            {(tool) => (
              <button {...api().getItemProps({ value: tool.value })} aria-label={tool.label} title={tool.label}>
                <Dynamic component={tool.icon} />
              </button>
            )}
          </For>
        </div>
        <p class="toggle-group-preview">
          Active tool: <strong>{tools.find((tool) => tool.value === api().value[0])?.label}</strong>
        </p>
      </div>
    </main>
  )
}
