<script lang="ts">
  import * as listbox from "@zag-js/listbox"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/listbox.css"

  interface Item {
    label: string
    value: string
  }

  const frameworks: Item[] = [
    { label: "React", value: "react" },
    { label: "Solid", value: "solid" },
    { label: "Vue", value: "vue" },
  ]

  let value = $state<string[]>(["react"])
  let options = $state.raw(frameworks)

  const collection = $derived(
    listbox.collection({
      items: options,
      itemToValue: (item) => item.value,
      itemToString: (item) => item.label,
    }),
  )

  const id = $props.id()
  const service = useMachine(listbox.machine as listbox.Machine<Item>, () => ({
    id,
    collection,
    value,
    onValueChange: (e) => (value = e.value),
  }))

  const api = $derived(listbox.connect(service, normalizeProps))
</script>

<main class="listbox" style="padding: 2rem">
  <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 320px">
    <div data-testid="selected-items" style="font-size: 0.875rem">
      <strong>Selected items (from api):</strong>
      {api.selectedItems.map((item) => item.label).join(", ")}
    </div>
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>Select framework</label>
      <div data-testid="listbox-content" {...api.getContentProps()}>
        <ul {...api.getListProps()}>
          {#each options as item (item.value)}
            <li data-testid={item.value} {...api.getItemProps({ item })}>
              <span {...api.getItemTextProps({ item })}>{item.label}</span>
              <span {...api.getItemIndicatorProps({ item })}>✓</span>
            </li>
          {/each}
        </ul>
      </div>
    </div>

    <button data-testid="filter-vue-button" onclick={() => (options = [frameworks[2]])}>Filter to Vue</button>
    <button
      data-testid="set-solid-button"
      onclick={() => {
        options = frameworks
        value = ["solid"]
      }}
    >
      Set value to Solid
    </button>
  </div>
</main>
