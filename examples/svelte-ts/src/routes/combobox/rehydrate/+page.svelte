<script lang="ts">
  import * as asyncList from "@zag-js/async-list"
  import * as combobox from "@zag-js/combobox"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { XIcon } from "lucide-svelte"
  import "@styles/combobox.css"

  interface Item {
    name: string
    height: string
    mass: string
    created: string
    edited: string
    url: string
  }

  const listService = useMachine(asyncList.machine as asyncList.Machine<Item>, {
    autoReload: true,
    async load({ signal, filter }) {
      const response = await fetch(`https://swapi.py4e.com/api/people/?search=${filter}`, { signal })
      const data = await response.json()
      return {
        items: data.results,
        cursor: data.next,
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
    defaultValue: ["C-3PO"],
    placeholder: "Example: Dexter",
    onInputValueChange({ inputValue }) {
      list.setFilter(inputValue)
    },
  }))

  const api = $derived(combobox.connect(service, normalizeProps))

  let hydrated = false
  $effect(() => {
    if (api.value.length && api.collection.size && !hydrated) {
      api.syncSelectedItems()
      hydrated = true
    }
  })
</script>

<main class="combobox">
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
      {#if api.collection.items.length > 0}
        <div {...api.getListProps()}>
          {#each api.collection.items as item (item.name)}
            <div data-testid={item.name} {...api.getItemProps({ item })}>
              <span {...api.getItemIndicatorProps({ item })}>✅</span>
              <span>{item.name}</span>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</main>
