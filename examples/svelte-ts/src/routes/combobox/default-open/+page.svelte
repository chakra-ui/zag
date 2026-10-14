<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as combobox from "@zag-js/combobox"
  import { createFilter } from "@zag-js/i18n-utils"
  import { comboboxControls, comboboxData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { XIcon } from "lucide-svelte"
  import "@styles/combobox.css"

  interface Item {
    code: string
    label: string
  }

  const { contains } = createFilter({ sensitivity: "base" })

  const controls = useControls(comboboxControls)

  let options = $state.raw(comboboxData)
  let selectedItems = $state.raw<Item[]>([])

  const collection = $derived(
    combobox.collection({
      items: options,
      itemToValue: (item) => item.code,
      itemToString: (item) => item.label,
    }),
  )

  const id = $props.id()
  const service = useMachine(
    combobox.machine as combobox.Machine<Item>,
    controls.mergeProps<combobox.Props<Item>>(() => ({
      id,
      collection,
      defaultOpen: true,
      onOpenChange() {
        options = comboboxData
      },
      onInputValueChange({ inputValue }) {
        const filtered = comboboxData.filter((item) => contains(item.label, inputValue))
        options = filtered.length > 0 ? filtered : comboboxData
      },
      onValueChange({ items }) {
        selectedItems = items as Item[]
      },
    })),
  )

  const api = $derived(combobox.connect(service, normalizeProps))
</script>

<main class="combobox">
  <div>
    <button onclick={() => api.setValue(["TG"])}>Set to Togo</button>
    <button data-testid="clear-value-button" onclick={() => api.clearValue()}>Clear Value</button>
    <pre data-testid="on-value-change-items">selectedItems: {selectedItems.map((item) => item.label).join(", ") ||
        "N/A"}</pre>
    <br />
    <div {...api.getRootProps()}>
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <label {...api.getLabelProps()}>Select country</label>
      <div {...api.getControlProps()}>
        <input data-testid="input" {...api.getInputProps()} />
        <button data-testid="trigger" {...api.getTriggerProps()}>▼</button>
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
