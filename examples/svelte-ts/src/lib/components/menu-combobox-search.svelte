<script lang="ts">
  import * as combobox from "@zag-js/combobox"
  import { createFilter } from "@zag-js/i18n-utils"
  import { comboboxData } from "@zag-js/shared"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"

  interface Props {
    onValueChange?: (details: combobox.ValueChangeDetails) => void
  }

  const props: Props = $props()

  const { contains } = createFilter({ sensitivity: "base" })

  let inputValue = $state("")

  const items = $derived(
    comboboxData.filter((item) => contains(item.label, inputValue) || contains(item.code, inputValue)),
  )

  const collection = $derived(
    combobox.collection({
      items,
      itemToValue: (item) => item.code,
      itemToString: (item) => item.label,
    }),
  )

  const id = $props.id()
  const service = useMachine(combobox.machine, () => ({
    id,
    disableLayer: true,
    open: true,
    placeholder: "Search items...",
    inputBehavior: "autohighlight" as const,
    selectionBehavior: "clear" as const,
    onInputValueChange(details) {
      inputValue = details.inputValue
    },
    collection,
    onValueChange: props.onValueChange,
  }))

  const api = $derived(combobox.connect(service, normalizeProps))
</script>

<div {...mergeProps(api.getRootProps(), { style: { width: "100%" } })}>
  <input {...mergeProps(api.getInputProps(), { style: { marginBottom: "12px" } })} />
  <div {...mergeProps(api.getContentProps(), { style: { minHeight: "120px" } })}>
    <div {...api.getListProps()}>
      {#if items.length === 0}
        <div>No results found</div>
      {/if}
      {#each items as item (item.label)}
        <div {...api.getItemProps({ item, persistFocus: true })}>
          {item.label}
        </div>
      {/each}
    </div>
  </div>
</div>
