<script lang="ts">
  import * as slider from "@zag-js/slider"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/slider.css"

  let value = $state([50])
  let endValue = $state([50])

  const id = $props.id()
  const service = useMachine(slider.machine, {
    thumbSize: 20,
    id,
    name: "quantity",
    defaultValue: [50],
    onValueChange(details) {
      value = details.value
    },
    onValueChangeEnd(details) {
      endValue = details.value
    },
  })

  const api = $derived(slider.connect(service, normalizeProps))
</script>

<main>
  <div {...api.getRootProps()}>
    <div {...api.getControlProps()}>
      <div data-testid="track" {...api.getTrackProps()}>
        <div {...api.getRangeProps()}></div>
      </div>
      {#each api.value as _, index}
        <div {...api.getThumbProps({ index })}>
          <input {...api.getHiddenInputProps({ index })} />
        </div>
      {/each}
    </div>

    <div style="display: flex; gap: 16px">
      <output>Change: {value[0]}</output>
      <output>Change end: {endValue[0]}</output>
    </div>
  </div>
</main>
