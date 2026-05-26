<script lang="ts">
  import * as drawer from "@zag-js/drawer"
  import { normalizeProps, portal, useMachine } from "@zag-js/svelte"
  import Presence from "$lib/components/presence.svelte"
  import styles from "../../../../../shared/styles/drawer-nested.module.css"

  const baseId = $props.id()

  let firstOpen = $state(false)
  let secondOpen = $state(false)
  let thirdOpen = $state(false)

  const firstService = useMachine(drawer.machine, {
    id: `${baseId}-root`,
    get open() {
      return firstOpen
    },
    onOpenChange({ open }) {
      firstOpen = open
      if (!open) {
        secondOpen = false
        thirdOpen = false
      }
    },
  })

  const secondService = useMachine(drawer.machine, {
    id: `${baseId}-second`,
    get open() {
      return secondOpen
    },
    onOpenChange({ open }) {
      secondOpen = open
      if (!open) thirdOpen = false
    },
  })

  const thirdService = useMachine(drawer.machine, {
    id: `${baseId}-third`,
    get open() {
      return thirdOpen
    },
    onOpenChange({ open }) {
      thirdOpen = open
    },
  })

  const firstApi = $derived(drawer.connect(firstService, normalizeProps))
  const secondApi = $derived(drawer.connect(secondService, normalizeProps))
  const thirdApi = $derived(drawer.connect(thirdService, normalizeProps))

  let deviceName = $state("Personal laptop")
  let notes = $state("Rotate recovery codes and revoke older sessions.")
</script>

<main class={styles.main}>
  <button {...firstApi.getTriggerProps()} class={styles.button}>Open drawer stack</button>

  <Presence {...firstApi.getBackdropProps()} class={styles.backdrop}></Presence>
  <div {...firstApi.getPositionerProps()} class={styles.positioner}>
    <Presence {...firstApi.getContentProps()} class={styles.contentHost}>
      <div class={styles.popup}>
        <div {...firstApi.getGrabberProps()} class={styles.handle}>
          <div {...firstApi.getGrabberIndicatorProps()}></div>
        </div>
        <div class={styles.content}>
          <div {...firstApi.getTitleProps()} class={styles.title}>Account</div>
          <p class={styles.description}>
            Nested drawers can be styled to stack, while each drawer remains independently focus managed.
          </p>

          <div class={styles.actions}>
            <div class={styles.actionsLeft}>
              <button {...secondApi.getTriggerProps()} class={styles.ghostButton}>Security settings</button>
            </div>
            <button {...firstApi.getCloseTriggerProps()} class={styles.button}>Close</button>
          </div>
        </div>
      </div>
    </Presence>
  </div>

  <div use:portal {...secondApi.getPositionerProps()} class={styles.positioner}>
    <Presence {...secondApi.getContentProps()} class={styles.contentHost}>
      <div class={styles.popup}>
        <div {...secondApi.getGrabberProps()} class={styles.handle}>
          <div {...secondApi.getGrabberIndicatorProps()}></div>
        </div>
        <div class={styles.content}>
          <div {...secondApi.getTitleProps()} class={styles.title}>Security</div>
          <p class={styles.description}>Review sign-in activity and update your security preferences.</p>

          <ul class={styles.list}>
            <li>Passkeys enabled</li>
            <li>2FA via authenticator app</li>
            <li>3 signed-in devices</li>
          </ul>

          <div class={styles.actions}>
            <div class={styles.actionsLeft}>
              <button {...thirdApi.getTriggerProps()} class={styles.ghostButton}>Advanced options</button>
            </div>
            <button {...secondApi.getCloseTriggerProps()} class={styles.button}>Close</button>
          </div>
        </div>
      </div>
    </Presence>
  </div>

  <div use:portal {...thirdApi.getPositionerProps()} class={styles.positioner}>
    <Presence {...thirdApi.getContentProps()} class={styles.contentHost}>
      <div class={styles.popup}>
        <div {...thirdApi.getGrabberProps()} class={styles.handle}>
          <div {...thirdApi.getGrabberIndicatorProps()}></div>
        </div>
        <div class={styles.content}>
          <div {...thirdApi.getTitleProps()} class={styles.title}>Advanced</div>
          <p class={styles.description}>This drawer is taller to demonstrate variable-height stacking.</p>

          <div class={styles.field}>
            <label class={styles.label} for="device-name">Device name</label>
            <input id="device-name" class={styles.input} bind:value={deviceName} />
          </div>

          <div class={styles.field}>
            <label class={styles.label} for="notes">Notes</label>
            <textarea id="notes" class={styles.textarea} rows={3} bind:value={notes}></textarea>
          </div>

          <div class={styles.actions}>
            <button {...thirdApi.getCloseTriggerProps()} class={styles.button}>Done</button>
          </div>
        </div>
      </div>
    </Presence>
  </div>
</main>
