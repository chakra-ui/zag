<script lang="ts">
  import * as wheelPicker from "@zag-js/wheel-picker"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  const collection = wheelPicker.collection({
    items: ["React", "Vue", "Angular", "Svelte", "Solid"].map((label) => ({ label, value: label.toLowerCase() })),
  })
  const id = $props.id()
  let value = $state("react")
  const service = useMachine(wheelPicker.machine, () => ({
    id,
    collection,
    value,
    onValueChange: ({ value: next }) => (value = next ?? "react"),
  }))
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
  </div>
  <div class="wheel-picker-actions">
    <button onclick={() => (value = "react")}>Select React</button><button onclick={() => (value = "svelte")}
      >Select Svelte</button
    >
  </div>
  <output>Controlled value: {api.valueAsString}</output>
</main>
