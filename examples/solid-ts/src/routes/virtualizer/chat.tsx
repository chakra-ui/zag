import type { StickToBottomDetails } from "@zag-js/dom-query/scroll"
import { mergeProps } from "@zag-js/solid"
import { createEffect, createSignal, For, onCleanup, Show } from "solid-js"
import { useListVirtualizer } from "../../hooks/use-virtualizer"

const lines = [
  "Short reply.",
  "A medium reply that wraps onto a second line in a narrow column.",
  "A long reply. ".repeat(8),
]
const createMessage = (id: number) => ({ id, text: `#${id} ${lines[Math.abs(id) % lines.length]}` })

export default function Page() {
  const [messages, setMessages] = createSignal(Array.from({ length: 2000 }, (_, index) => createMessage(index + 1)))
  const [streaming, setStreaming] = createSignal(true)
  const [sticky, setSticky] = createSignal<StickToBottomDetails | null>(null)

  const { virtualizer, ref } = useListVirtualizer(() => ({
    count: messages().length,
    estimatedItemSize: 48,
    overscan: 6,
    preserveScrollAnchor: true,
    stickToEnd: true,
    onStickToEndChange: setSticky,
    indexToKey: (index: number) => messages()[index].id,
    keyToIndex: (key: string | number) => Number(key) - messages()[0].id,
  }))

  createEffect(() => {
    if (!streaming()) return
    const timer = setInterval(() => {
      setMessages((prev) => [...prev, createMessage(prev[prev.length - 1].id + 1)])
    }, 700)
    onCleanup(() => clearInterval(timer))
  })

  const loadOlder = () => {
    setMessages((prev) => [
      ...Array.from({ length: 20 }, (_, index) => createMessage(prev[0].id - 20 + index)),
      ...prev,
    ])
  }

  return (
    <main style={{ padding: "20px" }}>
      <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={() => setStreaming((value) => !value)}>{streaming() ? "Pause" : "Stream"}</button>
        <button onClick={loadOlder}>Load older</button>
      </div>
      <div style={{ position: "relative", width: "360px", "margin-top": "12px" }}>
        <div
          ref={ref}
          {...mergeProps(() => virtualizer().getRootProps(), { style: { height: "400px", border: "1px solid #ccc" } })}
          aria-label="Messages"
        >
          <div {...virtualizer().getContentProps()}>
            <For each={virtualizer().getVirtualItems()}>
              {(item) => (
                <div {...virtualizer().getItemProps(item)} data-testid="message">
                  <p style={{ margin: 0, padding: "8px 12px", "border-bottom": "1px solid #eee" }}>
                    {messages()[item.index].text}
                  </p>
                </div>
              )}
            </For>
          </div>
        </div>
        <Show when={sticky()?.unseen}>
          <button
            style={{ position: "absolute", bottom: "12px", left: "50%", translate: "-50% 0" }}
            onClick={() => virtualizer().scrollToEnd({ behavior: "smooth" })}
          >
            Jump to latest
          </button>
        </Show>
      </div>
      <pre>{JSON.stringify(sticky())}</pre>
    </main>
  )
}
