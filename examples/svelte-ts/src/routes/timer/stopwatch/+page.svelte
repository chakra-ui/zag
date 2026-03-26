<script lang="ts">
  import styles from "../../../../../../shared/src/css/timer.module.css"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as timer from "@zag-js/timer"

  const id = $props.id()
  const service = useMachine(timer.machine, {
    id,
    autoStart: true,
  })

  const api = $derived(timer.connect(service, normalizeProps))
</script>

<main class="timer">
  <div {...api.getRootProps()} class={styles.Root}>
    <div {...api.getAreaProps()} class={styles.Area}>
      <div {...api.getItemProps({ type: "days" })} class={styles.Item}>{api.formattedTime.days}</div>
      <div {...api.getSeparatorProps()} class={styles.Separator}>:</div>
      <div {...api.getItemProps({ type: "hours" })} class={styles.Item}>{api.formattedTime.hours}</div>
      <div {...api.getSeparatorProps()} class={styles.Separator}>:</div>
      <div {...api.getItemProps({ type: "minutes" })} class={styles.Item}>{api.formattedTime.minutes}</div>
      <div {...api.getSeparatorProps()} class={styles.Separator}>:</div>
      <div {...api.getItemProps({ type: "seconds" })} class={styles.Item}>{api.formattedTime.seconds}</div>
    </div>

    <div {...api.getControlProps()} class={styles.Control}>
      <button {...api.getActionTriggerProps({ action: "start" })}>START</button>
      <button {...api.getActionTriggerProps({ action: "pause" })}>PAUSE</button>
      <button {...api.getActionTriggerProps({ action: "resume" })}>RESUME</button>
      <button {...api.getActionTriggerProps({ action: "reset" })}>RESET</button>
    </div>
  </div>
</main>

<Toolbar viz>
  <StateVisualizer state={service} />
</Toolbar>
