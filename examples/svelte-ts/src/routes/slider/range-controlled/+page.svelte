<script lang="ts">
  import * as slider from "@zag-js/slider"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/slider.css"

  const presets = [
    { label: "Any", value: [0, 1000] },
    { label: "Under $250", value: [0, 250] },
    { label: "$250 – $500", value: [250, 500] },
    { label: "$500+", value: [500, 1000] },
  ]

  let value = $state([200, 600])

  const id = $props.id()
  const service = useMachine(slider.machine, () => ({
    id,
    name: "price",
    value,
    min: 0,
    max: 1000,
    step: 10,
    thumbSize: 20,
    "aria-label": ["Minimum price", "Maximum price"],
    onValueChange(details) {
      value = details.value
    },
  }))

  const api = $derived(slider.connect(service, normalizeProps))
</script>

<main>
  <div {...api.getRootProps()}>
    <label {...api.getLabelProps()}>Price</label>
    <output {...api.getValueTextProps()}>
      ${value[0]} – ${value[1]}
    </output>
    <div {...api.getControlProps()}>
      <div {...api.getTrackProps()}>
        <div {...api.getRangeProps()}></div>
      </div>
      {#each api.value as _, index}
        <div {...api.getThumbProps({ index })}>
          <input {...api.getHiddenInputProps({ index })} />
        </div>
      {/each}
    </div>
  </div>
  <div class="hstack">
    {#each presets as preset (preset.label)}
      <button type="button" onclick={() => (value = preset.value)}>
        {preset.label}
      </button>
    {/each}
  </div>
</main>
