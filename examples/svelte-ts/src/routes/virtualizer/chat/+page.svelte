<script lang="ts">
  import { useListVirtualizer } from "#lib/use-virtualizer.svelte.ts"
  import type { StickToBottomDetails } from "@zag-js/dom-query/scroll"
  import { mergeProps } from "@zag-js/svelte"

  const lines = [
    "Short reply.",
    "A medium reply that wraps onto a second line in a narrow column.",
    "A long reply. ".repeat(8),
  ]
  const createMessage = (id: number) => ({ id, text: `#${id} ${lines[Math.abs(id) % lines.length]}` })

  let messages = $state(Array.from({ length: 2000 }, (_, index) => createMessage(index + 1)))
  let streaming = $state(true)
  let sticky = $state<StickToBottomDetails | null>(null)

  const id = $props.id()
  const vz = useListVirtualizer(() => ({
    id,
    count: messages.length,
    estimatedItemSize: 48,
    overscan: 6,
    preserveScrollAnchor: true,
    stickToEnd: true,
    onStickToEndChange: (details: StickToBottomDetails) => (sticky = details),
    indexToKey: (index: number) => messages[index].id,
    keyToIndex: (key: string | number) => Number(key) - messages[0].id,
  }))

  $effect(() => {
    if (!streaming) return
    const timer = setInterval(() => {
      messages = [...messages, createMessage(messages[messages.length - 1].id + 1)]
    }, 700)
    return () => clearInterval(timer)
  })

  function loadOlder() {
    const first = messages[0].id
    messages = [...Array.from({ length: 20 }, (_, index) => createMessage(first - 20 + index)), ...messages]
  }
</script>

<main style="padding: 20px">
  <div style="display: flex; gap: 8px">
    <button onclick={() => (streaming = !streaming)}>{streaming ? "Pause" : "Stream"}</button>
    <button onclick={loadOlder}>Load older</button>
  </div>
  <div style="position: relative; width: 360px; margin-top: 12px">
    <div
      {@attach vz.init}
      {...mergeProps(vz.virtualizer.getRootProps(), { style: { height: "400px", border: "1px solid #ccc" } })}
      aria-label="Messages"
    >
      <div {...vz.virtualizer.getContentProps()}>
        {#each vz.virtualizer.getVirtualItems() as item (item.key)}
          <div {...vz.virtualizer.getItemProps(item)} data-testid="message">
            <p style="margin: 0; padding: 8px 12px; border-bottom: 1px solid #eee">{messages[item.index].text}</p>
          </div>
        {/each}
      </div>
    </div>
    {#if sticky?.unseen}
      <button
        style="position: absolute; bottom: 12px; left: 50%; translate: -50% 0"
        onclick={() => vz.virtualizer.scrollToEnd({ behavior: "smooth" })}
      >
        Jump to latest
      </button>
    {/if}
  </div>
  <pre>{JSON.stringify(sticky)}</pre>
</main>
