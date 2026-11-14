<script lang="ts">
  import * as combobox from "@zag-js/combobox"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  interface Props {
    label: string
    items: string[]
    format: (value: string) => string
  }

  const { label, items, format }: Props = $props()

  let inputValue = $state("")

  const collection = $derived(combobox.collection({ items: items.filter((item) => item.includes(inputValue)) }))

  const id = $props.id()
  const service = useMachine(combobox.machine, () => ({
    id,
    collection,
    inputValue,
    onInputValueChange(details) {
      inputValue = format(details.inputValue)
    },
  }))

  const api = $derived(combobox.connect(service, normalizeProps))
</script>

<div>
  <div {...api.getRootProps()}>
    <label {...api.getLabelProps()}>{label}</label>
    <div {...api.getControlProps()}>
      <input {...api.getInputProps()} />
      <button {...api.getTriggerProps()}>▼</button>
    </div>
    <output>{inputValue}</output>
  </div>
  <div {...api.getPositionerProps()}>
    <div {...api.getContentProps()}>
      <div {...api.getListProps()}>
        {#each collection.items as item (item)}
          <div {...api.getItemProps({ item })}>{item}</div>
        {/each}
      </div>
    </div>
  </div>
</div>
