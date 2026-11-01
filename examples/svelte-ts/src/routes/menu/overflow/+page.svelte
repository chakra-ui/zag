<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import * as menu from "@zag-js/menu"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/menu.css"

  const items = [
    ...Array.from({ length: 20 }, (_, i) => ({ label: `Item ${i}`, value: `item-${i}` })),
    { label: "Zebra", value: "zebra" },
    ...Array.from({ length: 20 }, (_, i) => ({ label: `Item ${i + 20}`, value: `item-${i + 20}` })),
  ]

  const id = $props.id()
  const service = useMachine(menu.machine, { id })
  const api = $derived(menu.connect(service, normalizeProps))
</script>

<main style="padding: 40px">
  <p style="margin-bottom: 16px; color: #666">
    Use keyboard: open with Enter/Space, then ArrowDown to navigate. The highlighted item should scroll into view.
  </p>
  <div>
    <button {...api.getTriggerProps()}>
      Actions <span {...api.getIndicatorProps()}>▾</span>
    </button>
    {#if api.open}
      <Portal>
        <div {...api.getPositionerProps()}>
          <ul {...mergeProps(api.getContentProps(), { style: { maxHeight: "200px", overflowY: "auto" } })}>
            {#each items as item (item.value)}
              <li {...api.getItemProps({ value: item.value })}>
                {item.label}
              </li>
            {/each}
          </ul>
        </div>
      </Portal>
    {/if}
  </div>
</main>
