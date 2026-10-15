<script lang="ts">
  import * as angleSlider from "@zag-js/angle-slider"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/angle-slider.css"

  const PRESETS = [0, 90, 180, 270]

  let value = $state(45)

  const id = $props.id()
  const service = useMachine(angleSlider.machine, (): angleSlider.Props => ({
    id,
    value,
    onValueChange: (details) => (value = details.value),
  }))

  const api = $derived(angleSlider.connect(service, normalizeProps))

  const onInput = (event: Event & { currentTarget: HTMLInputElement }) => {
    const next = event.currentTarget.valueAsNumber
    value = Number.isNaN(next) ? 0 : Math.min(359, Math.max(0, next))
  }
</script>

<main class="angle-slider">
  <div class="angle-slider-layout">
    <div {...api.getRootProps()}>
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <label {...api.getLabelProps()}>
        Rotation
        <span {...api.getValueTextProps()}>{api.value}°</span>
      </label>
      <div {...api.getControlProps()}>
        <div {...api.getThumbProps()}></div>
      </div>
      <input {...api.getHiddenInputProps()} />
    </div>

    <div class="angle-slider-presets">
      {#each PRESETS as preset (preset)}
        <button aria-pressed={value === preset} onclick={() => (value = preset)}>{preset}°</button>
      {/each}
      <input type="number" aria-label="Rotation in degrees" min="0" max="359" {value} oninput={onInput} />
    </div>
  </div>
</main>
