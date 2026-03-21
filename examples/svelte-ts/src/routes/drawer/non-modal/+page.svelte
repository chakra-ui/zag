<script lang="ts">
  import * as drawer from "@zag-js/drawer"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import Presence from "$lib/components/presence.svelte"
  import styles from "../../../../../shared/styles/drawer.module.css"

  const id = $props.id()

  const service = useMachine(drawer.machine, {
    id,
    modal: false,
    closeOnInteractOutside: false,
    swipeDirection: "end",
  })

  const api = $derived(drawer.connect(service, normalizeProps))
</script>

<main style="padding: 24px">
  <button class={styles.trigger} {...api.getTriggerProps()}>Open Drawer</button>

  <div style="margin-top: 24px; padding: 16px; border: 1px dashed #d1d5db; border-radius: 8px">
    <p style="color: #6b7280; font-size: 14px">
      This area stays interactive while the drawer is open. Try typing below:
    </p>
    <input
      type="text"
      placeholder="Type something..."
      style="width: 100%; padding: 8px 12px; margin-top: 8px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 16px; outline: none; box-sizing: border-box"
    />
  </div>

  <div class={styles.positioner} {...api.getPositionerProps()}>
    <Presence class={styles.content} {...api.getContentProps()}>
      <div {...api.getTitleProps()}>Non-modal Drawer</div>
      <p {...api.getDescriptionProps()} style="color: #6b7280; margin: 8px 0 0; padding: 0 16px">
        No backdrop, no focus trap, no scroll lock. The page behind stays fully interactive. Close with the button, drag
        to dismiss, or Escape.
      </p>
      <div style="padding: 16px">
        <button {...api.getCloseTriggerProps()}>Close</button>
      </div>
    </Presence>
  </div>
</main>
