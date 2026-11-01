<script lang="ts">
  import * as drawer from "@zag-js/drawer"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import Presence from "#lib/components/presence.svelte"
  import styles from "@styles/drawer.module.css"

  const id = $props.id()

  let log = $state<(string | number | null)[]>([])

  const service = useMachine(drawer.machine, {
    id,
    snapPoints: ["20rem", "30rem", 1],
    defaultSnapPoint: "20rem",
    closeOnInteractOutside: false,
    onSnapPointChange(details) {
      log = [...log, details.snapPoint]
    },
  })

  const api = $derived(drawer.connect(service, normalizeProps))
</script>

<main>
  <div data-testid="snap-point">{String(api.snapPoint)}</div>
  <div data-testid="snap-point-log">{log.join(",")}</div>
  <div data-testid="open-state">{String(api.open)}</div>

  <button class={styles.trigger} {...api.getTriggerProps()}>Open</button>

  <Presence class={styles.backdrop} {...api.getBackdropProps()}></Presence>
  <div class={styles.positioner} {...api.getPositionerProps()}>
    <Presence class={styles.content} {...api.getContentProps()}>
      <div class={styles.grabber} {...api.getGrabberProps()}>
        <div class={styles.grabberIndicator} {...api.getGrabberIndicatorProps()}></div>
      </div>
      <div {...api.getTitleProps()}>Drawer</div>

      <button data-testid="reset" onclick={() => (log = [])}>Reset log</button>

      <button data-testid="set-30" onclick={() => api.setSnapPoint("30rem")}>setSnapPoint(30rem)</button>

      <button
        data-testid="set-30-then-20"
        onclick={() => {
          api.setSnapPoint("30rem")
          api.setSnapPoint("20rem")
        }}
      >
        setSnapPoint(30rem) then setSnapPoint(20rem)
      </button>

      <button
        data-testid="set-30-then-full"
        onclick={() => {
          api.setSnapPoint("30rem")
          api.setSnapPoint(1)
        }}
      >
        setSnapPoint(30rem) then setSnapPoint(1)
      </button>

      <button
        data-testid="set-30-repeatedly"
        onclick={() => {
          for (let i = 0; i < 5; i++) api.setSnapPoint("30rem")
        }}
      >
        setSnapPoint(30rem) five times
      </button>
    </Presence>
  </div>
</main>
