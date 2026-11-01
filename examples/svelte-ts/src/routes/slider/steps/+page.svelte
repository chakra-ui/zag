<script lang="ts">
  import * as slider from "@zag-js/slider"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/slider.css"

  const weights: Record<number, string> = {
    100: "Thin",
    200: "Extra Light",
    300: "Light",
    400: "Regular",
    500: "Medium",
    600: "Semi Bold",
    700: "Bold",
    800: "Extra Bold",
    900: "Black",
  }

  const stops = Object.keys(weights).map(Number)

  const id = $props.id()
  const service = useMachine(slider.machine, {
    id,
    name: "font-weight",
    defaultValue: [400],
    min: 100,
    max: 900,
    step: 100,
    largeStep: 200,
    thumbSize: 20,
    getAriaValueText: ({ value }) => `${value} ${weights[value]}`,
  })

  const api = $derived(slider.connect(service, normalizeProps))
  const weight = $derived(api.value[0])
</script>

<main>
  <div {...api.getRootProps()}>
    <label {...api.getLabelProps()}>Font weight</label>
    <output {...api.getValueTextProps()}>
      {weight} · {weights[weight]}
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
    <div {...api.getMarkerGroupProps()}>
      {#each stops as value}
        <span {...api.getMarkerProps({ value })}></span>
      {/each}
    </div>
  </div>
  <p style:font-weight={weight}>The quick brown fox</p>
</main>
