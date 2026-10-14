<script lang="ts">
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as toggle from "@zag-js/toggle-group"
  import { LayoutGridIcon, ListIcon } from "lucide-svelte"
  import "@styles/toggle-group.css"

  const views = [
    { value: "grid", label: "Grid", icon: LayoutGridIcon },
    { value: "list", label: "List", icon: ListIcon },
  ] as const

  const id = $props.id()
  const service = useMachine(toggle.machine, {
    id,
    defaultValue: ["grid"],
    deselectable: false,
  })

  const api = $derived(toggle.connect(service, normalizeProps))
</script>

<main class="toggle-group">
  <div class="vstack gap-4">
    <div {...api.getRootProps()} aria-label="View">
      {#each views as view (view.value)}
        <button {...api.getItemProps({ value: view.value })}>
          <view.icon />
          {view.label}
        </button>
      {/each}
    </div>

    <div class="toggle-group-items" data-view={api.value[0]}>
      {#each Array.from({ length: 6 }) as _, index (index)}
        <div></div>
      {/each}
    </div>
  </div>
</main>
