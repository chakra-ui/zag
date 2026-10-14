<script lang="ts">
  import Portal from "$lib/components/portal.svelte"
  import * as hoverCard from "@zag-js/hover-card"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/hover-card.css"

  let open = $state(false)
  let log = $state<string[]>([])

  const id = $props.id()
  const service = useMachine(hoverCard.machine, () => ({
    id,
    open,
    onOpenChange: (details) => {
      open = details.open
      log = [...log, `${details.open ? "open" : "close"}:${details.reason ?? "-"}`]
    },
  }))

  const api = $derived(hoverCard.connect(service, normalizeProps))
</script>

<div style="padding: 40px; height: 200vh">
  <h1>HoverCard Controlled</h1>
  <h1>{String(open)}</h1>
  <div data-testid="reason-log">{log.join(" ")}</div>
  <button type="button" data-testid="clear-log" onclick={() => (log = [])}>Clear log</button>

  <div style="display: flex; gap: 12px; margin-bottom: 24px">
    <button type="button" onclick={() => (open = true)}>Open</button>
    <button type="button" onclick={() => (open = false)}>Close</button>
  </div>

  <main class="hover-card">
    <div style="display: flex; gap: 50px">
      <a href="https://twitter.com/zag_js" target="_blank" {...api.getTriggerProps()}>Twitter</a>

      {#if api.open}
        <Portal>
          <div {...api.getPositionerProps()}>
            <div {...api.getContentProps()}>
              <div {...api.getArrowProps()}>
                <div {...api.getArrowTipProps()}></div>
              </div>
              Twitter Preview
              <a href="https://twitter.com/zag_js" target="_blank">Twitter</a>
            </div>
          </div>
        </Portal>
      {/if}
    </div>
  </main>
</div>
