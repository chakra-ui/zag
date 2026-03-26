<script lang="ts">
  import styles from "../../../../../../shared/src/css/progress.module.css"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as progress from "@zag-js/progress"
  import { progressControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const controls = useControls(progressControls)

  const id = $props.id()
  const service = useMachine(progress.machine, controls.mergeProps<progress.Props>({ id }))

  const api = $derived(progress.connect(service, normalizeProps))
</script>

<main class="progress">
  <div {...api.getRootProps()} class={styles.Root}>
    <div {...api.getLabelProps()}>Upload progress</div>

    <svg {...api.getCircleProps()} class={styles.Circle}>
      <circle {...api.getCircleTrackProps()} class={styles.CircleTrack} />
      <circle {...api.getCircleRangeProps()} class={styles.CircleRange} />
    </svg>

    <div {...api.getTrackProps()} class={styles.Track}>
      <div {...api.getRangeProps()} class={styles.Range}></div>
    </div>

    <div {...api.getValueTextProps()}>{api.valueAsString}</div>

    <div>
      <button onclick={() => api.setValue((api.value ?? 0) - 20)}>Decrease</button>
      <button onclick={() => api.setValue((api.value ?? 0) + 20)}>Increase</button>
      <button onclick={() => api.setValue(null)}>Indeterminate</button>
    </div>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
