<script lang="ts">
  import SliderPriceNumberInput from "$lib/components/slider-price-number-input.svelte"
  import * as slider from "@zag-js/slider"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { nan } from "@zag-js/utils"
  import "@styles/slider.css"
  import "@styles/number-input.css"

  const min = 500
  const max = 5000
  const minStepsBetweenThumbs = 100

  function getAdjustedValue(value: number[]) {
    let [start, end] = value as [number, number]

    const isOverflowing = start > end || end > max || start < min
    if (!isOverflowing) return value

    if (start > end || start < min) start = min
    if (end > max) end = max
    if (end < start) end = start + minStepsBetweenThumbs

    return [start, end]
  }

  let value = $state([max / 4, max / 2])

  const id = $props.id()
  const service = useMachine(slider.machine, () => ({
    thumbSize: 20,
    id,
    name: "quantity",
    min,
    max,
    minStepsBetweenThumbs,
    thumbAlignment: "center" as const,
    "aria-label": ["Minimum Price", "Maximum Price"],
    value: getAdjustedValue(value),
    onValueChange(details: slider.ValueChangeDetails) {
      value = details.value
    },
  }))

  const api = $derived(slider.connect(service, normalizeProps))

  function onChange(i: number, v: string) {
    const next = [...value]
    next[i] = nan(parseFloat(v))
    value = next
  }
</script>

<main class="slider">
  <div {...api.getRootProps()}>
    <div>
      <output {...api.getValueTextProps()}>{api.value.join(" - ")}</output>
    </div>
    <div {...api.getControlProps()}>
      <div {...api.getTrackProps()}>
        <div {...api.getRangeProps()}></div>
      </div>
      {#each api.value as _, index}
        <div {...api.getThumbProps({ index })}></div>
      {/each}
    </div>
  </div>

  <div style="display: flex; gap: 40px">
    {#each value as v, i}
      <SliderPriceNumberInput
        value={v.toString()}
        min={api.getThumbMin(i)}
        max={api.getThumbMax(i)}
        onChange={(next) => onChange(i, next)}
      />
    {/each}
  </div>
</main>
