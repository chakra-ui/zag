<script lang="ts">
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as combobox from "@zag-js/combobox"
  import { comboboxControls, comboboxData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const controls = useControls(comboboxControls)

  let options = $state.frozen(comboboxData)

  const collection = combobox.collection({
    items: comboboxData,
    itemToValue: (item) => item.code,
    itemToString: (item) => item.label,
  })

  controls.setContext("collection", collection)

  const [_state, send] = useMachine(
    combobox.machine({
      id: "1",
      collection,
      onOpenChange() {
        options = comboboxData
      },
      onInputValueChange({ value }) {
        const filtered = comboboxData.filter((item) => item.label.toLowerCase().includes(value.toLowerCase()))
        const newOptions = filtered.length > 0 ? filtered : comboboxData

        collection.setItems(newOptions)
        options = newOptions
      },
    }),
    {
      context: controls.context,
    },
  )

  const api = $derived(combobox.connect(_state, send, normalizeProps))
  $inspect(api.inputValue)
</script>

<main class="combobox">
  <div>
    <button onclick={() => api.setValue(["TG"])}>Set to Togo</button>
    <button data-testid="clear-value-button" onclick={() => api.clearValue()}> Clear Value </button>
    <br />
    <div {...api.rootProps}>
      <label {...api.labelProps}>Select country</label>
      <div {...api.controlProps}>
        <input data-testid="input" {...api.inputProps} />
        <button data-testid="trigger" {...api.triggerProps}> ▼ </button>
      </div>
    </div>
    <div {...api.positionerProps}>
      {#if options.length > 0}
        <ul data-testid="combobox-content" {...api.contentProps}>
          {#each options as item}
            <li data-testid={item.code} {...api.getItemProps({ item })}>
              {item.label}
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>
</main>

<Toolbar {controls} state={_state} />
