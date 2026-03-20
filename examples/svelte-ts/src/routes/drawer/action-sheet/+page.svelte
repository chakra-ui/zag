<script lang="ts">
  import * as drawer from "@zag-js/drawer"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import Presence from "$lib/components/presence.svelte"
  import styles from "../../../../../shared/styles/drawer-action-sheet.module.css"

  const id = $props.id()

  const service = useMachine(drawer.machine, { id })

  const api = $derived(drawer.connect(service, normalizeProps))
</script>

<main>
  <button class={styles.trigger} {...api.getTriggerProps()}>Manage Profile</button>
  <Presence class={styles.backdrop} {...api.getBackdropProps()}></Presence>
  <div class={styles.positioner} {...api.getPositionerProps()}>
    <Presence class={styles.popup} {...api.getContentProps({ draggable: false })}>
      <div class={styles.surface}>
        <div {...api.getTitleProps()} class={styles.title}>Profile Actions</div>
        <ul class={styles.actions}>
          <li class={styles.action}>
            <button type="button" class={styles.actionButton} onclick={() => api.setOpen(false)}>Edit Profile</button>
          </li>
          <li class={styles.action}>
            <button type="button" class={styles.actionButton} onclick={() => api.setOpen(false)}>Change Avatar</button>
          </li>
          <li class={styles.action}>
            <button type="button" class={styles.actionButton} onclick={() => api.setOpen(false)}>
              Privacy Settings
            </button>
          </li>
        </ul>
      </div>

      <div class={styles.dangerSurface}>
        <button type="button" class={styles.dangerButton} onclick={() => api.setOpen(false)}>Delete Account</button>
      </div>

      <div class={styles.surface}>
        <button type="button" class={styles.actionButton} {...api.getCloseTriggerProps()}>Cancel</button>
      </div>
    </Presence>
  </div>
</main>
