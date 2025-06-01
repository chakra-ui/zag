<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import { sliderControls } from "@zag-js/shared"
  import * as slider from "@zag-js/slider"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import serialize from "form-serialize"

  const controls = useControls(sliderControls)

  const id = $props.id()
  const service = useMachine(
    slider.machine,
    controls.mergeProps<slider.Props>({
      id,
      name: "quantity",
      defaultValue: [0],
    }),
  )

  const api = $derived(slider.connect(service, normalizeProps))
</script>

<main class="slider">
  <form
    oninput={(e) => {
      const formData = serialize(e.currentTarget, { hash: true })
      console.log(formData)
    }}
  >
    <div {...api.getRootProps()}>
      <div>
        <!-- svelte-ignore a11y_label_has_associated_control -->
        <label data-testid="label" {...api.getLabelProps()}> Slider Label </label>
        <output data-testid="output" {...api.getValueTextProps()}>
          {api.value}
        </output>
      </div>
      <div class="control-area">
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
        <div {...api.getMarkerGroupProps()}>
          <span {...api.getMarkerProps({ value: 10 })}>*</span>
          <span {...api.getMarkerProps({ value: 30 })}>*</span>
          <span {...api.getMarkerProps({ value: 90 })}>*</span>
        </div>
      </div>
    </div>
  </form>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
