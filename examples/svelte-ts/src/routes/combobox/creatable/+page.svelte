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

  // Fake server: slow, abortable, and rejects labels starting with "x"
  function saveLabel(label: string, signal: AbortSignal) {
    return new Promise<Item>((resolve, reject) => {
      const timer = setTimeout(() => {
        if (/^x/i.test(label)) reject(new Error(`"${label}" is reserved`))
        else resolve(toItem(label))
      }, 800)
      signal.addEventListener("abort", () => {
        clearTimeout(timer)
        reject(signal.reason)
      })
    })
  }

  let items = $state.raw(initialItems)
  let query = $state("")

  const filtered = $derived(items.filter((item) => contains(item.label, query.trim())))

  const collection = $derived(
    combobox.collection({
      items: filtered,
      itemToValue: (item) => item.value,
      itemToString: (item) => item.label,
    }),
  )

  const id = $props.id()
  const service = useMachine(combobox.machine as combobox.Machine<Item>, (): combobox.Props<Item> => ({
    id,
    collection,
    autoHighlight: true,
    onOpenChange({ open, reason }) {
      // Show every item, unless it opened because the user typed
      if (open && reason !== "input-change") query = ""
    },
    onInputValueChange({ inputValue, reason }) {
      if (reason !== "input-change") return
      query = inputValue
    },
    async onCreate({ inputValue, signal }) {
      const item = await saveLabel(inputValue, signal)
      items = [...items, item]
      return item.value
    },
  }))

  const api = $derived(combobox.connect(service, normalizeProps))
  const create = $derived(api.getCreateItemState())
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
  <pre data-testid="value">value: {JSON.stringify(api.value)}</pre>
  <div {...api.getPositionerProps()}>
    <div {...api.getContentProps()}>
      <div {...api.getListProps()}>
        {#each filtered as item (item.value)}
          <div {...api.getItemProps({ item })}>
            <span {...api.getItemTextProps({ item })}>{item.label}</span>
            <span {...api.getItemIndicatorProps({ item })}>✓</span>
          </div>
        {/each}
        <div {...api.getCreateItemProps()}>
          <span>{create.pending ? `Creating "${create.inputValue}"…` : `Create "${create.inputValue}"`}</span>
          {#if create.error}
            <span class="combobox-create-error">{create.error.message}</span>
          {/if}
        </div>
      </div>
    </div>
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>
