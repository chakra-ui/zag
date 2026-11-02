<script lang="ts">
  import * as listbox from "@zag-js/listbox"
  import { Car, CookingPot, Coffee, Dumbbell, PawPrint, Snowflake, Waves, Wifi } from "lucide-svelte"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { listboxData, type ListboxOption } from "@zag-js/shared"
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import "@styles/listbox.css"

  const collection = listbox.collection({ items: listboxData.amenities })

  const icons = {
    wifi: Wifi,
    parking: Car,
    pool: Waves,
    gym: Dumbbell,
    breakfast: Coffee,
    pets: PawPrint,
    ac: Snowflake,
    kitchen: CookingPot,
  }

  const id = $props.id()
  const service = useMachine(listbox.machine as listbox.Machine<ListboxOption>, {
    id,
    collection,
    orientation: "horizontal",
    selectionMode: "multiple",
    defaultValue: ["wifi", "breakfast"],
  })

  const api = $derived(listbox.connect(service, normalizeProps))
</script>

<main class="listbox listbox-tags">
  <div {...api.getRootProps()}>
    <label {...api.getLabelProps()}>Amenities</label>
    <div {...api.getContentProps()}>
      <ul {...api.getListProps()}>
        {#each listboxData.amenities as item (item.value)}
          {@const Icon = icons[item.value as keyof typeof icons]}
          <li {...api.getItemProps({ item, highlightOnHover: true })}>
            <Icon class="listbox-item-icon" aria-hidden="true" />
            <span {...api.getItemIndicatorProps({ item })}>✓</span>
            <span {...api.getItemTextProps({ item })}>{item.label}</span>
          </li>
        {/each}
      </ul>
    </div>
  </div>
</main>

<Toolbar viz>
  <StateVisualizer state={service} context={["value", "highlightedValue"]} />
</Toolbar>
