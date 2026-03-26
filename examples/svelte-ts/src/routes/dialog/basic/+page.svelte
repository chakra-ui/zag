<script lang="ts">
  import styles from "../../../../../../shared/src/css/dialog.module.css"
  import * as dialog from "@zag-js/dialog"
  import { portal, normalizeProps, useMachine } from "@zag-js/svelte"

  const id = $props.id()
  const service = useMachine(dialog.machine, { id })

  const api = $derived(dialog.connect(service, normalizeProps))
</script>

<main>
  <button {...api.getTriggerProps()}> Click me</button>
  {#if api.open}
    <div use:portal {...api.getBackdropProps()} class={styles.Backdrop}></div>
    <div use:portal {...api.getPositionerProps()} class={styles.Positioner}>
      <div {...api.getContentProps()} class={styles.Content}>
        <h2 {...api.getTitleProps()} class={styles.Title}>Edit profile</h2>
        <p {...api.getDescriptionProps()} class={styles.Description}>Make changes to your profile here. Click save when you are done.</p>
        <div>
          <input placeholder="Enter name..." />
          <button>Save</button>
        </div>
        <button {...api.getCloseTriggerProps()} class={styles.CloseTrigger}>Close</button>
      </div>
    </div>
  {/if}
</main>
