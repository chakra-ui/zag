<script lang="ts">
  import { trackDismissableElement } from "@zag-js/dismissable"
  import "@styles/dismissable.css"

  let open = $state(false)
  let draft = $state("")
  let blocked = $state(false)

  let triggerRef = $state<HTMLButtonElement>()
  let panelRef = $state<HTMLDivElement>()

  $effect(() => {
    if (!open || !panelRef || !triggerRef) return
    return trackDismissableElement(panelRef, {
      exclude: [triggerRef],
      onLayerChange: () => {},
      onInteractOutside(event) {
        if (!draft) return
        event.preventDefault()
        blocked = true
      },
      onEscapeKeyDown(event) {
        if (!draft) return
        event.preventDefault()
        blocked = true
      },
      onDismiss: () => (open = false),
    })
  })
</script>

<main class="prevent-dismiss">
  <button
    bind:this={triggerRef}
    data-testid="trigger"
    onclick={() => {
      blocked = false
      open = !open
    }}
  >
    Reply to Ama
  </button>

  <div bind:this={panelRef} hidden={!open} role="dialog" aria-label="Reply" data-testid="panel" class="panel">
    <label for="reply">Your reply</label>
    <textarea
      id="reply"
      data-testid="reply"
      value={draft}
      oninput={(event) => {
        draft = event.currentTarget.value
        if (!draft) blocked = false
      }}></textarea>
    <p role="status" data-testid="hint" class="hint">
      {blocked ? "Your reply is not sent yet. Clear it to close this panel." : ""}
    </p>
  </div>

  <p data-testid="outside">
    Ama asked whether the Lagos shipment will arrive before the 14th. Click here to try closing the reply.
  </p>
</main>
