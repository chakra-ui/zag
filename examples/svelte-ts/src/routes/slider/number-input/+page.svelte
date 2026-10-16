<script lang="ts">
  import SliderPriceInput from "$lib/components/slider-price-input.svelte"
  import * as slider from "@zag-js/slider"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/slider.css"
  import "@styles/number-input.css"

  const min = 0
  const max = 1000

  let value = $state([200, 600])

  const id = $props.id()
  const service = useMachine(slider.machine, () => ({
    id,
    name: "price",
    min,
    max,
    step: 10,
    minStepsBetweenThumbs: 10,
    thumbSize: 20,
    getAriaLabel: ({ index }) => (index === 0 ? "Minimum price" : "Maximum price"),
    value,
    onValueChange(details: slider.ValueChangeDetails) {
      value = details.value
    },
  }))

  const api = $derived(slider.connect(service, normalizeProps))

  const setThumb = (index: number) => (next: number) => api.setThumbValue(index, next)
</script>

<main>
  <div {...api.getRootProps()}>
    <label {...api.getLabelProps()}>Price</label>
    <output {...api.getValueTextProps()}>${value[0]} – ${value[1]}</output>
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
    <SliderPriceInput label="Min" value={value[0]} {min} max={api.getThumbMax(0)} onChange={setThumb(0)} />
    <SliderPriceInput label="Max" value={value[1]} min={api.getThumbMin(1)} {max} onChange={setThumb(1)} />
  </div>
</main>
