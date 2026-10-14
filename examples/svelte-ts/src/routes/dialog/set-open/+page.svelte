<script lang="ts">
  import Portal from "$lib/components/portal.svelte"
  import * as dialog from "@zag-js/dialog"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { XIcon } from "lucide-svelte"

  let log = $state<boolean[]>([])

  const id = $props.id()
  const service = useMachine(dialog.machine, {
    id,
    onOpenChange(details) {
      log = [...log, details.open]
    },
  })
  const api = $derived(dialog.connect(service, normalizeProps))
</script>

<main>
  <div data-testid="open-state">{String(api.open)}</div>
  <div data-testid="open-change-log">{log.join(",")}</div>

  <button data-testid="reset" onclick={() => (log = [])}>Reset log</button>

  <button data-testid="set-open" onclick={() => api.setOpen(true)}>setOpen(true)</button>

  <button data-testid="set-closed" onclick={() => api.setOpen(false)}>setOpen(false)</button>

  <button
    data-testid="open-then-close"
    onclick={() => {
      api.setOpen(true)
      api.setOpen(false)
    }}
  >
    setOpen(true) then setOpen(false)
  </button>

  <button
    data-testid="close-then-open"
    onclick={() => {
      api.setOpen(false)
      api.setOpen(true)
    }}
  >
    setOpen(false) then setOpen(true)
  </button>

  <button
    data-testid="open-repeatedly"
    onclick={() => {
      for (let i = 0; i < 5; i++) api.setOpen(true)
    }}
  >
    setOpen(true) five times
  </button>

  {#if api.open}
    <Portal>
      <div {...api.getBackdropProps()}></div>
      <div {...api.getPositionerProps()}>
        <div {...api.getContentProps()}>
          <h2 {...api.getTitleProps()}>Imperative control</h2>
          <p {...api.getDescriptionProps()}>Opened and closed through api.setOpen.</p>
          <button data-testid="content-set-closed" onclick={() => api.setOpen(false)}>setOpen(false)</button>
          <button {...api.getCloseTriggerProps()}>
            <XIcon />
          </button>
        </div>
      </div>
    </Portal>
  {/if}
</main>
