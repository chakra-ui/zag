<script lang="ts">
  import styles from "../../../../../../shared/src/css/angle-slider.module.css"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as angleSlider from "@zag-js/angle-slider"
  import { angleSliderControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const controls = useControls(angleSliderControls)

  const id = $props.id()
  const service = useMachine(
    angleSlider.machine,
    controls.mergeProps<angleSlider.Props>({
      id,
    }),
  )

  const api = $derived(angleSlider.connect(service, normalizeProps))
</script>

<main class="angle-slider">
  <div {...api.getRootProps()} class={styles.Root}>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label {...api.getLabelProps()} class={styles.Label}>
      Angle Slider: <div {...api.getValueTextProps()}>{api.valueAsDegree}</div>
    </label>
    <div {...api.getControlProps()} class={styles.Control}>
      <div {...api.getThumbProps()} class={styles.Thumb}></div>
      <div {...api.getMarkerGroupProps()} class={styles.MarkerGroup}>
        {#each [0, 45, 90, 135, 180, 225, 270, 315] as value}
          <div {...api.getMarkerProps({ value })} class={styles.Marker}></div>
        {/each}
      </div>
    </div>
    <input {...api.getHiddenInputProps()} />
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
