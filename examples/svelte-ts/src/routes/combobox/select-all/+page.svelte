<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import * as combobox from "@zag-js/combobox"
  import { createFilter } from "@zag-js/i18n-utils"
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
  const items = $derived(comboboxData.filter((item) => contains(item.label, query)))

  const collection = $derived(
    combobox.collection({
      items,
      itemToValue: (item) => item.code,
      itemToString: (item) => item.label,
    }),
  )

  const id = $props.id()
  const service = useMachine(combobox.machine as combobox.Machine<Item>, (): combobox.Props<Item> => ({
    id,
    collection,
    multiple: true,
    onOpenChange({ open }) {
      if (open) query = ""
    },
    onInputValueChange({ inputValue, reason }) {
      if (reason === "input-change") query = inputValue
    },
  }))

  const api = $derived(combobox.connect(service, normalizeProps))
  const selectAll = $derived(api.getSelectAllState())
</script>

<main class="combobox">
  <div {...api.getRootProps()}>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label {...api.getLabelProps()}>Countries</label>
    <div {...api.getControlProps()}>
      <input {...api.getInputProps()} placeholder={`${api.value.length} selected`} />
      <button {...api.getTriggerProps()}>▼</button>
      <button {...api.getClearTriggerProps()}>
        <XIcon />
      </button>
    </div>
  </div>
  <pre data-testid="value">value: {api.value.join(", ") || "—"}</pre>
  <div {...api.getPositionerProps()}>
    <div {...api.getContentProps()}>
      <div {...api.getListProps()}>
        <!-- Selects every item that matches the text, or unselects them all -->
        <div {...api.getSelectAllProps()}>
          <span class="combobox-check">{selectAll.checked ? "✓" : selectAll.indeterminate ? "–" : ""}</span>
          <span>{selectAll.checked ? "Unselect all" : "Select all"}</span>
        </div>
        <hr {...api.getSeparatorProps()} />
        {#each items as item (item.code)}
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
  <StateVisualizer state={service} />
</Toolbar>
