<script lang="ts">
  import * as combobox from "@zag-js/combobox"
  import { createFilter } from "@zag-js/i18n-utils"
  import { comboboxData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/combobox.css"

  const { contains } = createFilter({ sensitivity: "base" })

  let options = $state.raw(comboboxData)
  let selected = $state("")

  const collection = $derived(
    combobox.collection({
      items: options,
      itemToValue: (item) => item.code,
      itemToString: (item) => item.label,
    }),
  )

  const id = $props.id()
  const service = useMachine(combobox.machine, {
    id,
    get collection() {
      return collection
    },
    inline: true,
    inputBehavior: "autohighlight",
    onInputValueChange({ inputValue }) {
      options = comboboxData.filter((item) => contains(item.label, inputValue))
    },
    onSelect({ itemValue }) {
      selected = collection.stringify(itemValue) ?? ""
    },
  })

  const api = $derived(combobox.connect(service, normalizeProps))
</script>

<main class="combobox">
  <output data-testid="selected">Selected: {selected}</output>
  <div {...api.getRootProps()}>
    <div {...api.getControlProps()}>
      <input data-testid="input" {...api.getInputProps()} />
    </div>
    <ul {...api.getListProps()}>
      {#each options as item (item.code)}
        <li {...api.getItemProps({ item })}>
          <span>{item.label}</span>
        </li>
      {/each}
    </ul>
  </div>
</main>
