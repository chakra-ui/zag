<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import * as combobox from "@zag-js/combobox"
  import { createFilter } from "@zag-js/utils/search"
  import { comboboxData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { XIcon } from "lucide-svelte"
  import "@styles/combobox.css"

  interface Item {
    code: string
    label: string
  }

  const { contains } = createFilter({ sensitivity: "base" })

  let query = $state("")

  const collection = $derived(
    combobox.collection({
      items: comboboxData.filter((item) => contains(item.label, query)),
      itemToValue: (item) => item.code,
      itemToString: (item) => item.label,
    }),
  )

  const id = $props.id()
  const service = useMachine(combobox.machine as combobox.Machine<Item>, (): combobox.Props<Item> => ({
    id,
    collection,
    multiple: true,
    defaultValue: ["US", "CA"],
    onInputValueChange({ inputValue }) {
      query = inputValue
    },
  }))

  const api = $derived(combobox.connect(service, normalizeProps))
</script>

<main class="combobox">
  <div {...api.getRootProps()}>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label {...api.getLabelProps()}>Countries</label>
    <div {...api.getControlProps()}>
      <div {...api.getChipGroupProps()}>
        {#each api.selectedItems as item (item.code)}
          <span {...api.getChipProps({ item })}>
            {item.label}
            <button {...api.getChipDeleteTriggerProps({ item })}>
              <XIcon />
            </button>
          </span>
        {/each}
        <input {...api.getInputProps()} placeholder={api.value.length ? "" : "Add countries"} />
      </div>
    </div>
  </div>

  <div {...api.getPositionerProps()}>
    <div {...api.getContentProps()}>
      <div {...api.getListProps()}>
        {#each collection.items as item (item.code)}
          <div {...api.getItemProps({ item })}>
            <span {...api.getItemTextProps({ item })}>{item.label}</span>
            <span {...api.getItemIndicatorProps({ item })}>✓</span>
          </div>
        {/each}
      </div>
    </div>
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} context={["value", "inputValue", "highlightedValue"]} />
</Toolbar>
