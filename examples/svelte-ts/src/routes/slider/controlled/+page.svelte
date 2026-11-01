<script lang="ts">
  import * as slider from "@zag-js/slider"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/slider.css"

  const presets = [0, 25, 50, 100]

  let value = $state([25])

  const id = $props.id()
  const service = useMachine(slider.machine, () => ({
    id,
    name: "zoom",
    value,
    thumbSize: 20,
    onValueChange(details) {
      value = details.value
    },
  }))

  const api = $derived(slider.connect(service, normalizeProps))
</script>

<main>
  <div {...api.getRootProps()}>
    <label {...api.getLabelProps()}>Zoom</label>
    <output {...api.getValueTextProps()}>{value[0]}%</output>
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
    {#each presets as preset}
      <button type="button" onclick={() => (value = [preset])}>
        {preset}%
      </button>
    {/each}
  </div>
</main>
