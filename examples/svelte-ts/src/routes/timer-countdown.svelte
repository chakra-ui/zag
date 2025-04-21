<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as timer from "@zag-js/timer"

  const id = $props.id()
  const service = useMachine(timer.machine, {
    id,
    countdown: true,
    autoStart: true,
    startMs: timer.parse({ days: 2, seconds: 10 }),
    onComplete() {
      console.log("Timer completed")
    },
  })

  const api = $derived(timer.connect(service, normalizeProps))
</script>

<main class="timer">
  <div {...api.getRootProps()}>
    <div {...api.getAreaProps()}>
      <div {...api.getItemProps({ type: "days" })}>{api.formattedTime.days}</div>
      <div {...api.getSeparatorProps()}>:</div>
      <div {...api.getItemProps({ type: "hours" })}>{api.formattedTime.hours}</div>
      <div {...api.getSeparatorProps()}>:</div>
      <div {...api.getItemProps({ type: "minutes" })}>{api.formattedTime.minutes}</div>
      <div {...api.getSeparatorProps()}>:</div>
      <div {...api.getItemProps({ type: "seconds" })}>{api.formattedTime.seconds}</div>
    </div>

    <div {...api.getControlProps()}>
      <button {...api.getActionTriggerProps({ action: "start" })}>START</button>
      <button {...api.getActionTriggerProps({ action: "pause" })}>PAUSE</button>
      <button {...api.getActionTriggerProps({ action: "resume" })}>RESUME</button>
      <button {...api.getActionTriggerProps({ action: "reset" })}>RESET</button>
    </div>
  </div>
</main>

<Toolbar controls={null} viz>
  <StateVisualizer state={service} />
</Toolbar>
