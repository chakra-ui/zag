<script lang="ts">
  import * as drawer from "@zag-js/drawer"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { XIcon } from "lucide-svelte"
  import Presence from "$lib/components/presence.svelte"
  import styles from "@styles/drawer.module.css"

  const id = $props.id()

  let open = $state(true)

  const service = useMachine(drawer.machine, () => ({
    id,
    open,
    onOpenChange(details) {
      // Simulate an async setter (history API, transitions, etc.)
      setTimeout(() => (open = details.open), 1000)
    },
  }))

  const api = $derived(drawer.connect(service, normalizeProps))
</script>

<main style="padding: 20px">
  <h3>Controlled (async/delayed setter)</h3>
  <p style="font-size: 14px; color: #6b7280">
    The <code>open</code> setter is delayed by 80ms to mimic an async source of truth.
  </p>
  <button class={styles.trigger} {...api.getTriggerProps()}>Toggle Drawer</button>
  <Presence class={styles.backdrop} {...api.getBackdropProps()}></Presence>
  <div class={styles.positioner} {...api.getPositionerProps()}>
    <Presence class={styles.content} {...api.getContentProps()}>
      <div class={styles.grabber} {...api.getGrabberProps()}>
        <div class={styles.grabberIndicator} {...api.getGrabberIndicatorProps()}></div>
      </div>
      <div {...api.getTitleProps()}>Controlled Drawer (async)</div>
      <p {...api.getDescriptionProps()}>Swipe down to close or click the backdrop. Watch for flicker.</p>
      <p style="font-size: 14px">
        Open: <strong>{String(open)}</strong>
      </p>
      <button {...api.getCloseTriggerProps()}>
        <XIcon />
      </button>
    </Presence>
  </div>
</main>
