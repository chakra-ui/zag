<script lang="ts">
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import { sliderControls } from "@zag-js/shared"
  import * as slider from "@zag-js/slider"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import serialize from "form-serialize"

  const controls = useControls(sliderControls)

  const [_state, send] = useMachine(
    slider.machine({
      id: "1",
      name: "quantity",
      value: [0],
    }),
    {
      context: controls.context,
    },
  )

  const api = $derived(slider.connect(_state, send, normalizeProps))
</script>

<main class="slider">
  <form
    onChange={(e) => {
      const formData = serialize(e.currentTarget, { hash: true })
      console.log(formData)
    }}
  >
    <div {...api.rootProps}>
      <div>
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label data-testid="label" {...api.labelProps}> Slider Label </label>
        <output data-testid="output" {...api.valueTextProps}>
          {api.value}
        </output>
      </div>
      <div class="control-area">
        <div {...api.controlProps}>
          <div data-testid="track" {...api.trackProps}>
            <div {...api.rangeProps} />
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
          <span {...api.getMarkerProps({ value: 90 })}>*</span>
        </div>
      </div>
    </div>
  </form>
</main>

<Toolbar {controls} state={_state} />
