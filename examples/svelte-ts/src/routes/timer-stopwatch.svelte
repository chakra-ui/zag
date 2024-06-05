<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as timer from "@zag-js/timer"

  const [snapshot, send] = useMachine(
    timer.machine({
      id: "s1",
      autoStart: true,
    }),
  )

  const api = $derived(timer.connect(snapshot, send, normalizeProps))
</script>

<main class="timer">
  <div {...api.getRootProps()}>
    <div {...api.getSegmentProps({ type: "days" })}>{api.formattedTime.days}</div>
    <div {...api.getSeparatorProps()}>:</div>
    <div {...api.getSegmentProps({ type: "hours" })}>{api.formattedTime.hours}</div>
    <div {...api.getSeparatorProps()}>:</div>
    <div {...api.getSegmentProps({ type: "minutes" })}>{api.formattedTime.minutes}</div>
    <div {...api.getSeparatorProps()}>:</div>
    <div {...api.getSegmentProps({ type: "seconds" })}>{api.formattedTime.seconds}</div>
  </div>

  <div style="display:flex; gap: 4px">
    <button onclick={api.start}>START</button>
    <button onclick={api.pause}>PAUSE</button>
    <button onclick={api.resume}>RESUME</button>
    <button onclick={api.reset}>RESET</button>
  </div>
</main>

<Toolbar controls={null} viz>
  <StateVisualizer state={snapshot} />
</Toolbar>
