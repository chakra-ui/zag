<script lang="ts">
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as toggle from "@zag-js/toggle-group"
  import { AlignCenterIcon, AlignJustifyIcon, AlignLeftIcon, AlignRightIcon } from "lucide-svelte"
  import "@styles/toggle-group.css"

  const options = [
    { value: "left", label: "Align left", icon: AlignLeftIcon },
    { value: "center", label: "Align center", icon: AlignCenterIcon },
    { value: "right", label: "Align right", icon: AlignRightIcon },
    { value: "justify", label: "Justify", icon: AlignJustifyIcon },
  ] as const

  const id = $props.id()
  const service = useMachine(toggle.machine, {
    id,
    defaultValue: ["left"],
    // Single choice that can't be cleared, like a radio group
    deselectable: false,
  })

  const api = $derived(toggle.connect(service, normalizeProps))
</script>

<main class="toggle-group">
  <div class="vstack gap-4">
    <div {...api.getRootProps()} aria-label="Text alignment">
      {#each options as option (option.value)}
        <button {...api.getItemProps({ value: option.value })} aria-label={option.label} title={option.label}>
          <option.icon />
        </button>
      {/each}
    </div>

    <p class="toggle-group-preview" style:text-align={api.value[0]}>
      Zag machines handle the behavior; you bring the markup and styles. This paragraph follows the selected alignment.
    </p>
  </div>
</main>
