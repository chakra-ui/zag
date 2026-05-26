<script lang="ts">
  import * as drawer from "@zag-js/drawer"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import Presence from "$lib/components/presence.svelte"
  import styles from "../../../../../shared/styles/drawer.module.css"

  interface Props {
    id: string
  }

  let { id }: Props = $props()

  let open = $state(false)

  const service = useMachine(drawer.machine, () => ({
    get id() {
      return id
    },
    get open() {
      return open
    },
    onOpenChange({ open: next }) {
      open = next
    },
  }))

  const api = $derived(drawer.connect(service, normalizeProps))
</script>

<div>
  <h3>Controlled (open + onOpenChange)</h3>
  <p style="font-size: 14px; color: #6b7280">Standard controlled mode. Open state is managed by Svelte.</p>
  <button class={styles.trigger} {...api.getTriggerProps()}>Open Controlled</button>
  <Presence class={styles.backdrop} {...api.getBackdropProps()}></Presence>
  <div class={styles.positioner} {...api.getPositionerProps()}>
    <Presence class={styles.content} {...api.getContentProps()}>
      <div class={styles.grabber} {...api.getGrabberProps()}>
        <div class={styles.grabberIndicator} {...api.getGrabberIndicatorProps()}></div>
      </div>
      <div {...api.getTitleProps()}>Controlled Drawer</div>
      <p {...api.getDescriptionProps()}>
        This drawer is fully controlled. Swipe, escape, and outside click all work.
      </p>
      <p style="font-size: 14px">
        Open: <strong>{String(open)}</strong>
      </p>
      <button {...api.getCloseTriggerProps()}>Close</button>
    </Presence>
  </div>
</div>
