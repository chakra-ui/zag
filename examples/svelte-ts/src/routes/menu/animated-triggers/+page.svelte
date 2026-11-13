<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import Presence from "#lib/components/presence.svelte"
  import * as menu from "@zag-js/menu"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/menu-viewport.css"

  const menus = [
    { value: "file", label: "File", items: ["New file", "Open…", "Save", "Save as…"] },
    { value: "edit", label: "Edit", items: ["Undo", "Redo", "Cut", "Copy", "Paste"] },
    { value: "view", label: "View", items: ["Zoom in", "Zoom out", "Toggle full screen mode"] },
  ]

  const id = $props.id()
  const service = useMachine(menu.machine, {
    id,
    positioning: { placement: "bottom-start" },
  })

  const api = $derived(menu.connect(service, normalizeProps))
</script>

<main class="menu animated-triggers">
  <div class="animated-triggers__list">
    {#each menus as item (item.value)}
      <button {...api.getTriggerProps({ value: item.value })}>{item.label}</button>
    {/each}
  </div>

  <Portal>
    <div {...api.getPositionerProps()}>
      <Presence {...api.getArrowProps()}>
        <div {...api.getArrowTipProps()}></div>
      </Presence>
      <Presence {...api.getViewportProps()}>
        {#each menus as item (item.value)}
          <Presence {...api.getContentProps({ value: item.value })}>
            {#each item.items as label (label)}
              <div {...api.getItemProps({ value: `${item.value}:${label}` })}>{label}</div>
            {/each}
          </Presence>
        {/each}
      </Presence>
    </div>
  </Portal>
</main>
