<script lang="ts">
  import Highlight from "#lib/components/highlight.svelte"
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import * as combobox from "@zag-js/combobox"
  import { comboboxData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { XIcon } from "lucide-svelte"
  import "@styles/combobox.css"

  interface Item {
    code: string
    label: string
  }

  const matches = (text: string, query: string) => text.toLowerCase().includes(query.toLowerCase())

  let query = $state("")
  const options = $derived(comboboxData.filter((item) => matches(item.label, query)))

  const collection = $derived(
    combobox.collection({
      items: options,
      itemToValue: (item) => item.code,
      itemToString: (item) => item.label,
    }),
  )

  const id = $props.id()
  const service = useMachine(combobox.machine as combobox.Machine<Item>, () => ({
    id,
    collection,
    onInputValueChange({ inputValue, reason }) {
      // A selected label or cleared input isn't a query
      query = reason === "input-change" ? inputValue : ""
    },
  }))

  const api = $derived(combobox.connect(service, normalizeProps))
</script>

<main class="combobox">
  <div {...api.getRootProps()}>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label {...api.getLabelProps()}>Select country</label>
    <div {...api.getControlProps()}>
      <input {...api.getInputProps()} />
      <button {...api.getTriggerProps()}>▼</button>
      <button {...api.getClearTriggerProps()}>
        <XIcon />
      </button>
    </div>
  </div>
  <div {...api.getPositionerProps()}>
    <div {...api.getContentProps()}>
      <div {...api.getEmptyProps()}>{options.length === 0 ? "No results found" : ""}</div>
      {#if options.length > 0}
        <div {...api.getListProps()}>
          {#each options as item (item.code)}
            <div {...api.getItemProps({ item })}>
              <span {...api.getItemTextProps({ item })}>
                <Highlight text={item.label} {query} />
              </span>
              <span {...api.getItemIndicatorProps({ item })}>✓</span>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>
