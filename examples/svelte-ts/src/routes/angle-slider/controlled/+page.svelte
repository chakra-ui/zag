<script lang="ts">
  import * as angleSlider from "@zag-js/angle-slider"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/angle-slider.css"

  const id = $props.id()
  let value = $state(45)

  const service = useMachine(angleSlider.machine, () => ({
    id,
    value,
    onValueChange(details) {
      value = details.value
    },
  }))

  const api = $derived(angleSlider.connect(service, normalizeProps))
</script>

<main class="angle-slider">
  <h1>Angle Slider — Controlled</h1>
  <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 16px;">
    <input
      type="number"
      min={0}
      max={359}
      {value}
      oninput={(event) => {
        const next = event.currentTarget.valueAsNumber
        value = Number.isNaN(next) ? 0 : Math.min(359, Math.max(0, next))
      }}
    />
    <button type="button" onclick={() => (value = 0)}>Reset</button>
  </div>
  <div {...api.getRootProps()}>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label {...api.getLabelProps()}>
      Angle Slider: <div {...api.getValueTextProps()}>{api.valueAsDegree}</div>
    </label>
    <div {...api.getControlProps()}>
      <div {...api.getThumbProps()}></div>
    </div>
    <input {...api.getHiddenInputProps()} />
  </div>
</main>
