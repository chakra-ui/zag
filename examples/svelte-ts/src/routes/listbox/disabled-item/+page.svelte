<script lang="ts">
  import * as listbox from "@zag-js/listbox"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { listboxControls, listboxData, type ListboxOption } from "@zag-js/shared"
  import { useControls } from "#lib/use-controls.svelte.ts"
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import "@styles/listbox.css"

  // "Same day" is disabled through its `disabled` field
  const collection = listbox.collection({ items: listboxData.shippingMethods })

  const controls = useControls(listboxControls)

  const id = $props.id()
  const service = useMachine(
    listbox.machine,
    controls.mergeProps<listbox.Props<ListboxOption>>({
      id,
      collection,
      defaultValue: ["standard"],
    }),
  )

  const api = $derived(listbox.connect(service, normalizeProps))
</script>

<main class="listbox">
  <div {...api.getRootProps()}>
    <label {...api.getLabelProps()}>Shipping method</label>
    <div {...api.getContentProps()}>
      <ul {...api.getListProps()}>
        {#each listboxData.shippingMethods as item (item.value)}
          <li {...api.getItemProps({ item, highlightOnHover: true })}>
            <div class="listbox-item-body">
              <span {...api.getItemTextProps({ item })}>{item.label}</span>
              <span class="listbox-item-description">{item.description}</span>
            </div>
            <span {...api.getItemIndicatorProps({ item })}>✓</span>
          </li>
        {/each}
      </ul>
    </div>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} context={["value", "highlightedValue"]} />
</Toolbar>
