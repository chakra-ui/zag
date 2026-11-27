<script lang="ts">
  import Toolbar from "#lib/components/toolbar.svelte"
  import { trackStickToBottom, type StickToBottom, type StickToBottomDetails } from "@zag-js/dom-query/scroll"
  import * as scrollArea from "@zag-js/scroll-area"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/scroll-area.css"

  const createMessage = (id: number) => ({ id, text: `Message ${id}` })

  let messages = $state(Array.from({ length: 20 }, (_, index) => createMessage(index + 1)))
  let streaming = $state(true)
  let sticky = $state<StickToBottomDetails>({ following: true, atBottom: true, unseen: false })

  const id = $props.id()
  const service = useMachine(scrollArea.machine, { id })
  const api = $derived(scrollArea.connect(service, normalizeProps))

  let viewportEl = $state<HTMLElement | null>(null)
  let contentEl = $state<HTMLElement | null>(null)
  let tracker: StickToBottom | null = null

  $effect(() => {
    if (!viewportEl) return
    tracker = trackStickToBottom(viewportEl, { content: contentEl, onChange: (details) => (sticky = details) })
    return () => tracker?.cleanup()
  })

  $effect(() => {
    if (!streaming) return
    const timer = setInterval(() => {
      messages = [...messages, createMessage(messages[messages.length - 1].id + 1)]
    }, 800)
    return () => clearInterval(timer)
  })

  function loadOlder() {
    const first = messages[0].id
    messages = [...Array.from({ length: 5 }, (_, index) => createMessage(first - 5 + index)), ...messages]
  }
</script>

<main class="scroll-area">
  <div style="display: flex; gap: 8px">
    <button onclick={() => (streaming = !streaming)}>{streaming ? "Pause" : "Stream"}</button>
    <button onclick={loadOlder}>Load older</button>
  </div>
  <div {...api.getRootProps()} style="height: 320px; position: relative">
    <div bind:this={viewportEl} {...api.getViewportProps()} data-following={sticky.following || undefined}>
      <div bind:this={contentEl} {...api.getContentProps()}>
        {#each messages as message (message.id)}
          <p data-testid="message">{message.text}</p>
        {/each}
      </div>
    </div>
    {#if api.hasOverflowY}
      <div {...api.getScrollbarProps({ orientation: "vertical" })}>
        <div {...api.getThumbProps({ orientation: "vertical" })}></div>
      </div>
    {/if}
    {#if sticky.unseen}
      <button
        style="position: absolute; bottom: 12px; left: 50%; translate: -50% 0"
        onclick={() => tracker?.scrollToBottom({ behavior: "smooth" })}
      >
        Jump to latest
      </button>
    {/if}
  </div>
</main>

<Toolbar>
  <pre>{JSON.stringify(sticky, null, 2)}</pre>
</Toolbar>
