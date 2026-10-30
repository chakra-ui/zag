<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import { useControls } from "#lib/use-controls.svelte.ts"
  import { sliderControls } from "@zag-js/shared"
  import * as slider from "@zag-js/slider"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/slider.css"

  const controls = useControls(sliderControls)

  const id = $props.id()
  const service = useMachine(
    slider.machine,
    controls.mergeProps<slider.Props>({
      id,
      name: "quantity",
      defaultValue: [20, 60],
      thumbSize: 20,
    }),
  )

  const api = $derived(slider.connect(service, normalizeProps))
</script>

<main>
  <div {...api.getRootProps()}>
    <label {...api.getLabelProps()}>Quantity</label>
    <output {...api.getValueTextProps()}>{api.value.join(" – ")}</output>
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
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
