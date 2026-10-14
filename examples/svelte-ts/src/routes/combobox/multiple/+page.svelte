<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as combobox from "@zag-js/combobox"
  import { createFilter } from "@zag-js/i18n-utils"
  import { comboboxData } from "@zag-js/shared"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import { XIcon } from "lucide-svelte"
  import "@styles/combobox.css"

  interface Item {
    code: string
    label: string
  }

  const { contains } = createFilter({ sensitivity: "base" })

  const controls = useControls({
    removeSelected: {
      type: "boolean",
      defaultValue: false,
    },
  })

  let options = $state.raw(comboboxData)
  // Non-reactive on purpose, like a ref
  let selectedValue: string[] = []

  const items = $derived(
    controls.context.removeSelected ? options.filter((item) => !selectedValue.includes(item.code)) : options,
  )

  const collection = $derived(
    combobox.collection({
      items,
      itemToValue: (item) => item.code,
      itemToString: (item) => item.label,
    }),
  )

  const id = $props.id()
  const service = useMachine(combobox.machine as combobox.Machine<Item>, () => ({
    id,
    collection,
    onInputValueChange({ inputValue }) {
      const filtered = comboboxData.filter((item) => contains(item.label, inputValue))
      options = filtered.length > 0 ? filtered : comboboxData
    },
    multiple: true,
    onValueChange({ value }) {
      selectedValue = value
    },
  }))

  const api = $derived(combobox.connect(service, normalizeProps))
</script>

<main class="combobox">
  <div>
    <b>{service.state.get()}</b>
    <b> / {api.highlightedValue || "-"}</b>
    <pre data-testid="value-text">{api.valueAsString}</pre>
    <div {...api.getRootProps()}>
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <label {...api.getLabelProps()}>Select country</label>
      <div {...api.getControlProps()}>
        <input data-testid="input" {...api.getInputProps()} />
        <button
          data-testid="trigger"
          {...mergeProps(api.getTriggerProps(), {
            onclick: () => (options = comboboxData),
          })}
        >
          ▼
        </button>
        <button {...api.getClearTriggerProps()}>
          <XIcon />
        </button>
      </div>
    </div>

    <div {...api.getPositionerProps()}>
      <div data-testid="combobox-content" {...api.getContentProps()}>
        {#if options.length > 0}
          <div {...api.getListProps()}>
            {#each options as item (item.code)}
              <div data-testid={item.code} {...api.getItemProps({ item })}>
                <span {...api.getItemIndicatorProps({ item })}>✅</span>
                <span>{item.label}</span>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
