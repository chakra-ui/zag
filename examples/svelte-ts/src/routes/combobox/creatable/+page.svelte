<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import * as combobox from "@zag-js/combobox"
  import { createFilter } from "@zag-js/i18n-utils"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { XIcon } from "lucide-svelte"
  import "@styles/combobox.css"

  interface Item {
    label: string
    value: string
  }

  const toItem = (label: string): Item => ({ label, value: label.toLowerCase() })

  const initialItems = ["Bug", "Feature", "Enhancement", "Documentation"].map(toItem)

  const { contains } = createFilter({ sensitivity: "base" })

  let items = $state.raw(initialItems)
  let query = $state("")

  const search = $derived(query.trim())
  const filtered = $derived(items.filter((item) => contains(item.label, search)))
  // The "Create" option is the new item itself, so selecting it needs no extra mapping
  const exists = $derived(items.some((item) => item.label.toLowerCase() === search.toLowerCase()))
  const newItem = $derived(search && !exists ? toItem(search) : null)
  const options = $derived(newItem ? [...filtered, newItem] : filtered)

  const collection = $derived(
    combobox.collection({
      items: options,
      itemToValue: (item) => item.value,
      itemToString: (item) => item.label,
    }),
  )

  const id = $props.id()
  const service = useMachine(combobox.machine as combobox.Machine<Item>, (): combobox.Props<Item> => ({
    id,
    collection,
    allowCustomValue: true,
    onOpenChange({ open, reason }) {
      // Show every item, unless it opened because the user typed
      if (open && reason !== "input-change") query = ""
    },
    onInputValueChange({ inputValue, reason }) {
      if (reason === "input-change") query = inputValue
    },
    onValueChange({ items: selected }) {
      const [item] = selected as Item[]
      if (item && !items.some((existing) => existing.value === item.value)) {
        items = [...items, item]
      }
    },
  }))

  const api = $derived(combobox.connect(service, normalizeProps))
</script>

<main class="combobox">
  <div {...api.getRootProps()}>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label {...api.getLabelProps()}>Label</label>
    <div {...api.getControlProps()}>
      <input {...api.getInputProps()} placeholder="Search or create" />
      <button {...api.getTriggerProps()}>▼</button>
      <button {...api.getClearTriggerProps()}>
        <XIcon />
      </button>
    </div>
  </div>
  <div {...api.getPositionerProps()}>
    <div {...api.getContentProps()}>
      <div {...api.getListProps()}>
        {#each options as item (item.value)}
          <div {...api.getItemProps({ item })}>
            <span {...api.getItemIndicatorProps({ item })}>✅</span>
            <span>{item.value === newItem?.value ? `Create "${item.label}"` : item.label}</span>
          </div>
        {/each}
      </div>
    </div>
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>
