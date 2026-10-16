<script lang="ts">
  import Output from "$lib/components/output.svelte"
  import * as slider from "@zag-js/slider"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/slider.css"

  let value = $state([50])
  let endValue = $state([50])

  const id = $props.id()
  const service = useMachine(slider.machine, {
    id,
    name: "brightness",
    defaultValue: [50],
    thumbSize: 20,
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
    <label {...api.getLabelProps()}>Brightness</label>
    <output {...api.getValueTextProps()}>{api.value}</output>
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
  <div class="hstack gap-4">
    <Output label="onValueChange" value={value[0]} />
    <Output label="onValueChangeEnd" value={endValue[0]} />
  </div>
</main>
