<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import { sliderControls } from "@zag-js/shared"
  import * as slider from "@zag-js/slider"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import serialize from "form-serialize"

  const controls = useControls(sliderControls)

  const [snapshot, send] = useMachine(
    slider.machine({
      id: "1",
      name: "quantity",
      value: [10, 60],
    }),
    { context: controls.context },
  )

  const api = $derived(slider.connect(snapshot, send, normalizeProps))
</script>

<main class="slider">
  <form
    oninput={(e) => {
      const formData = serialize(e.currentTarget, { hash: true })
      console.log(formData)
    }}
  >
    <div {...api.rootProps}>
      <div>
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label {...api.labelProps}>Quantity:</label>
        <output {...api.valueTextProps}>{api.value.join(" - ")}</output>
      </div>
      <div class="control-area">
        <div {...api.controlProps}>
          <div {...api.trackProps}>
            <div {...api.rangeProps}></div>
          </div>
          {#each api.value as _, index}
            <div {...api.getThumbProps({ index })}>
              <input {...api.getHiddenInputProps({ index })} />
            </div>
          {/each}
        </div>
        <div {...api.markerGroupProps}>
          <span {...api.getMarkerProps({ value: 10 })}>*</span>
          <span {...api.getMarkerProps({ value: 30 })}>*</span>
          <span {...api.getMarkerProps({ value: 50 })}>*</span>
          <span {...api.getMarkerProps({ value: 90 })}>*</span>
        </div>
      </div>
    </div>
  </form>
</main>

<Toolbar {controls}>
  <StateVisualizer state={snapshot} />
</Toolbar>
