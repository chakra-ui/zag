<script lang="ts">
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as toggle from "@zag-js/toggle-group"
  import { EraserIcon, HandIcon, MousePointer2Icon, PencilIcon, SquareIcon } from "lucide-svelte"
  import "@styles/toggle-group.css"

  const tools = [
    { value: "select", label: "Select", icon: MousePointer2Icon },
    { value: "hand", label: "Hand", icon: HandIcon },
    { value: "pencil", label: "Pencil", icon: PencilIcon },
    { value: "shape", label: "Shape", icon: SquareIcon },
    { value: "eraser", label: "Eraser", icon: EraserIcon },
  ] as const

  const id = $props.id()
  const service = useMachine(toggle.machine, {
    id,
    orientation: "vertical",
    defaultValue: ["select"],
    deselectable: false,
  })

  const api = $derived(toggle.connect(service, normalizeProps))
</script>

<main class="toggle-group">
  <div class="hstack gap-4 items-start">
    <!-- Arrow up/down move focus in a vertical group -->
    <div {...api.getRootProps()} aria-label="Tools">
      {#each tools as tool (tool.value)}
        <button {...api.getItemProps({ value: tool.value })} aria-label={tool.label} title={tool.label}>
          <tool.icon />
        </button>
      {/each}
    </div>
    <p class="toggle-group-preview">
      Active tool: <strong>{tools.find((tool) => tool.value === api.value[0])?.label}</strong>
    </p>
  </div>
</main>
