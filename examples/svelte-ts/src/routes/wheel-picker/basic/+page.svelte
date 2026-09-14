<script lang="ts">
  import * as wheelPicker from "@zag-js/wheel-picker"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  const collection = wheelPicker.collection({
    items: ["React", "Vue", "Angular", "Svelte", "Solid", "Preact"].map((label) => ({
      label,
      value: label.toLowerCase(),
    })),
  })
  const id = $props.id()
  const service = useMachine(wheelPicker.machine, { id, collection, defaultValue: "react", name: "framework" })
  const api = $derived(wheelPicker.connect(service, normalizeProps))
</script>

<main class="wheel-picker">
  <div {...api.getRootProps()}>
    <label {...api.getLabelProps()}>Framework</label>
    <div {...api.getControlProps()}>
      <div {...api.getViewportProps()}>
        <ul {...api.getItemGroupProps()}>
          {#each api.items as { item, index, key } (key)}<li {...api.getItemProps({ item, index })}>
              {item.label}
            </li>{/each}
        </ul>
        <div {...api.getHighlightProps()}>
          <ul {...api.getHighlightItemGroupProps()}>
            {#each api.highlightItems as { item, index, key } (key)}<li {...api.getHighlightItemProps({ item, index })}>
                {item.label}
              </li>{/each}
          </ul>
        </div>
      </div>
    </div>
    <select {...api.getHiddenSelectProps()}
      >{#each collection.items as item}<option value={item.value}>{item.label}</option>{/each}</select
    >
  </div>
  <output>Selected: {api.valueAsString}</output>
</main>
<Toolbar><StateVisualizer state={service} /></Toolbar>
