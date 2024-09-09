<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as combobox from "@zag-js/combobox"
  import { comboboxControls, comboboxData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { matchSorter } from "match-sorter"

  const controls = useControls(comboboxControls)

  let options = $state.raw(comboboxData)

  const collection = combobox.collection({
    items: comboboxData,
    itemToValue: (item) => item.code,
    itemToString: (item) => item.label,
  })

  controls.setContext("collection", collection)

  const [snapshot, send] = useMachine(
    combobox.machine({
      id: "1",
      collection,
      onOpenChange() {
        options = comboboxData
      },
      onInputValueChange({ inputValue }) {
        const filtered = matchSorter(comboboxData, inputValue, { keys: ["label"] })
        const newOptions = filtered.length > 0 ? filtered : comboboxData

        collection.setItems(newOptions)
        options = newOptions
      },
    }),
    {
      context: controls.context,
    },
  )

  const api = $derived(combobox.connect(snapshot, send, normalizeProps))
  $inspect(api.inputValue)
</script>

<main class="combobox">
  <div>
    <button onclick={() => api.setValue(["TG"])}>Set to Togo</button>
    <button data-testid="clear-value-button" onclick={() => api.clearValue()}> Clear Value </button>
    <br />
    <div {...api.getRootProps()}>
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <label {...api.getLabelProps()}>Select country</label>
      <div {...api.getControlProps()}>
        <input data-testid="input" {...api.getInputProps()} />
        <button data-testid="trigger" {...api.getTriggerProps()}> ▼ </button>
      </div>
    </div>
    <div {...api.getPositionerProps()}>
      {#if options.length > 0}
        <ul data-testid="combobox-content" {...api.getContentProps()}>
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

<Toolbar {controls}>
  <StateVisualizer state={snapshot} />
</Toolbar>
