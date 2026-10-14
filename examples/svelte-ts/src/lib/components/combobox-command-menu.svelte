<script lang="ts">
  import type { ListCollection } from "@zag-js/collection"
  import * as combobox from "@zag-js/combobox"
  import type { commandData } from "@zag-js/shared"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"

  interface Props {
    matches: Record<string, commandData.Command[]>
    collection: ListCollection<commandData.Command>
    onValueChange: (details: combobox.ValueChangeDetails<commandData.Command>) => void
    onInputValueChange: (details: combobox.InputValueChangeDetails) => void
  }

  const props: Props = $props()

  const matchEntries = $derived(Object.entries(props.matches))

  const id = $props.id()
  const service = useMachine(combobox.machine as combobox.Machine<commandData.Command>, () => ({
    open: true,
    disableLayer: true,
    placeholder: "Type a command or search term...",
    loopFocus: false,
    collection: props.collection,
    onValueChange: props.onValueChange,
    onInputValueChange: props.onInputValueChange,
    id,
    inputBehavior: "autohighlight" as const,
    selectionBehavior: "clear" as const,
  }))

  const api = $derived(combobox.connect(service, normalizeProps))
</script>

<div {...mergeProps(api.getRootProps(), { style: "width: 100%" })}>
  <input {...mergeProps(api.getInputProps(), { style: "margin-bottom: 12px" })} />
  <div {...mergeProps(api.getContentProps(), { style: "min-height: 120px" })}>
    <div {...api.getListProps()}>
      {#if matchEntries.length === 0}
        <div>No results found</div>
      {/if}
      {#each matchEntries as [group, items] (group)}
        <div {...api.getItemGroupProps({ id: group })}>
          <div {...api.getItemGroupLabelProps({ htmlFor: group })}>{group}</div>
          {#each items as item (item.name)}
            <div {...api.getItemProps({ item, persistFocus: true })}>
              {item.title}
            </div>
          {/each}
        </div>
      {/each}
    </div>
  </div>
</div>
