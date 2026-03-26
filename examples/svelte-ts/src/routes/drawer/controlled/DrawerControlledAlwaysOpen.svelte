<script lang="ts">
  import * as drawer from "@zag-js/drawer"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import Presence from "$lib/components/presence.svelte"
  import styles from "../../../../../shared/styles/drawer.module.css"

  interface Props {
    id: string
  }

  let { id }: Props = $props()

  const service = useMachine(drawer.machine, () => ({
    get id() {
      return id
    },
    open: true,
  }))

  const api = $derived(drawer.connect(service, normalizeProps))
</script>

<div>
  <h3>Always Open (no onOpenChange)</h3>
  <p style="font-size: 14px; color: #6b7280">
    This drawer has <code>open: true</code> without <code>onOpenChange</code>. Swiping, escape, and outside click should
    have no effect.
  </p>
  <Presence {...api.getBackdropProps()} class={styles.backdrop}></Presence>
  <div {...api.getPositionerProps()} class={styles.positioner}>
    <Presence {...api.getContentProps()} class={styles.content}>
      <div {...api.getGrabberProps()} class={styles.grabber}>
        <div {...api.getGrabberIndicatorProps()} class={styles.grabberIndicator}></div>
      </div>
      <div {...api.getTitleProps()}>Always Open</div>
      <p {...api.getDescriptionProps()}>
        Try swiping down, pressing Escape, or clicking outside. This drawer should never close.
      </p>
    </Presence>
  </div>
</div>
