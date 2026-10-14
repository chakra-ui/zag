<script lang="ts">
  import * as asyncList from "@zag-js/async-list"
  import * as combobox from "@zag-js/combobox"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/combobox.css"

  interface Item {
    name: string
    url: string
  }

  let selected = $state<string[]>([])

  const listService = useMachine(asyncList.machine as asyncList.Machine<Item>, {
    autoReload: true,
    async load({ signal, filter }) {
      const response = await fetch(`https://swapi.py4e.com/api/people/?search=${filter ?? ""}`, { signal })
      const data = await response.json()
      return {
        items: data.results ?? [],
        cursor: data.next ?? null,
      }
    },
  })

  const list = $derived(asyncList.connect(listService))

  const collection = $derived(
    combobox.collection({
      items: list.items,
      itemToValue: (item) => item.name,
      itemToString: (item) => item.name,
    }),
  )

  const id = $props.id()
  const service = useMachine(combobox.machine as combobox.Machine<Item>, () => ({
    id,
    collection,
    placeholder: "Search people...",
    onInputValueChange({ inputValue }) {
      list.setFilter(inputValue)
    },
    onValueChange({ value }) {
      selected = value
    },
  }))

  const api = $derived(combobox.connect(service, normalizeProps))
</script>

<main class="combobox" style="padding: 2rem">
  <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 360px">
    <div data-testid="selected-value" style="font-size: 0.875rem">
      <strong>Selected:</strong>
      {selected.join(", ")}
    </div>

    <div {...api.getRootProps()}>
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <label {...api.getLabelProps()}>Search Star Wars characters</label>
      <div {...mergeProps(api.getControlProps(), { style: "display: flex; margin-top: 4px" })}>
        <input data-testid="input" {...mergeProps(api.getInputProps(), { style: "flex: 1; padding: 8px 12px" })} />
        <button data-testid="trigger" {...mergeProps(api.getTriggerProps(), { style: "padding: 8px" })}>▼</button>
      </div>
    </div>

    {#if list.isLoading}
      <div data-testid="loading" style="font-size: 0.875rem">Loading...</div>
    {/if}

    <div {...api.getPositionerProps()}>
      <div
        data-testid="combobox-content"
        {...mergeProps(api.getContentProps(), { style: "list-style: none; padding: 4px" })}
      >
        {#if api.collection.items.length > 0}
          <div {...api.getListProps()}>
            {#each api.collection.items as item (item.name)}
              <div
                data-testid={`item-${item.name}`}
                {...mergeProps(api.getItemProps({ item }), { style: "padding: 8px 12px; cursor: pointer" })}
              >
                {item.name}
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
</main>
