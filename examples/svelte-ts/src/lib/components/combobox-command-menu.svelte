<script lang="ts">
  import type { ListCollection } from "@zag-js/collection"
  import * as combobox from "@zag-js/combobox"
  import type { commandData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

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
    inline: true,
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

<div {...api.getRootProps()}>
  <input {...api.getInputProps()} />
  <div {...api.getContentProps()}>
    <div {...api.getEmptyProps()}>{matchEntries.length === 0 ? "No results found" : ""}</div>
    <div {...api.getListProps()}>
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
