<script lang="ts">
  import * as listbox from "@zag-js/listbox"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"

  interface Item {
    label: string
    value: string
  }

  type Props = { label?: string } & Omit<listbox.Props<Item>, "id">

  const props: Props = $props()

  const id = $props.id()
  const service = useMachine(listbox.machine as listbox.Machine<Item>, () => {
    const { label: _label, ...rest } = props
    return { id, selectionMode: "multiple" as const, ...rest }
  })

  const api = $derived(listbox.connect(service, normalizeProps))
</script>

<div {...mergeProps(api.getRootProps(), { style: { flex: "1" } })}>
  {#if props.label}
    <label {...api.getLabelProps()}>{props.label}</label>
  {/if}
  <div {...mergeProps(api.getContentProps(), { style: { width: "100%", height: "100%" } })}>
    <ul {...mergeProps(api.getListProps(), { style: { width: "100%", height: "100%" } })}>
      {#each props.collection.items as item (item.value)}
        <li {...api.getItemProps({ item })}>
          <span {...api.getItemTextProps({ item })}>{item.label}</span>
          <span {...api.getItemIndicatorProps({ item })}>✓</span>
        </li>
      {/each}
    </ul>
  </div>
</div>
