<script lang="ts">
  import * as combobox from "@zag-js/combobox"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/combobox.css"

  const links = [
    { label: "Basic", href: "/combobox/basic" },
    { label: "Async", href: "/combobox/async" },
    { label: "Multiple", href: "/combobox/multiple" },
  ]

  let items = $state.raw(links)
  let selection = $state.raw<combobox.SelectionDetails | null>(null)

  const collection = $derived(
    combobox.collection({
      items,
      itemToValue: (item) => item.href,
      itemToString: (item) => item.label,
    }),
  )

  const id = $props.id()
  const service = useMachine(combobox.machine, () => ({
    id,
    collection,
    onSelect: (details) => (selection = details),
    onInputValueChange({ inputValue }) {
      items = links.filter((item) => item.label.toLowerCase().includes(inputValue.toLowerCase()))
    },
  }))

  const api = $derived(combobox.connect(service, normalizeProps))
</script>

<main class="combobox">
  <div {...api.getRootProps()}>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label {...api.getLabelProps()}>Go to page</label>
    <div {...api.getControlProps()}>
      <input data-testid="input" {...api.getInputProps()} />
    </div>
  </div>
  <div {...api.getPositionerProps()}>
    <div data-testid="combobox-content" {...api.getContentProps()}>
      {#each items as item (item.href)}
        <a href={item.href} {...api.getItemProps({ item })}>{item.label}</a>
      {/each}
    </div>
  </div>
  <pre data-testid="selection">{JSON.stringify(selection)}</pre>
</main>
