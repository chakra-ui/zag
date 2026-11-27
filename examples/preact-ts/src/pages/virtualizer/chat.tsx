import { mergeProps } from "@zag-js/preact"
import type { StickToBottomDetails } from "@zag-js/dom-query/scroll"
import { useEffect, useState } from "preact/hooks"
import { useListVirtualizer } from "../../hooks/use-virtualizer"

const lines = [
  "Short reply.",
  "A medium reply that wraps onto a second line in a narrow column.",
  "A long reply. ".repeat(8),
]
const createMessage = (id: number) => ({ id, text: `#${id} ${lines[Math.abs(id) % lines.length]}` })

export default function Page() {
  const [messages, setMessages] = useState(() => Array.from({ length: 2000 }, (_, index) => createMessage(index + 1)))
  const [streaming, setStreaming] = useState(true)
  const [sticky, setSticky] = useState<StickToBottomDetails | null>(null)

  const { virtualizer, ref } = useListVirtualizer({
    count: messages.length,
    estimatedItemSize: 48,
    overscan: 6,
    preserveScrollAnchor: true,
    stickToEnd: true,
    onStickToEndChange: setSticky,
    indexToKey: (index) => messages[index].id,
    keyToIndex: (key) => Number(key) - messages[0].id,
  })

  useEffect(() => {
    if (!streaming) return
    const timer = setInterval(() => {
      setMessages((prev) => [...prev, createMessage(prev[prev.length - 1].id + 1)])
    }, 700)
    return () => clearInterval(timer)
  }, [streaming])

  const loadOlder = () => {
    setMessages((prev) => [
      ...Array.from({ length: 20 }, (_, index) => createMessage(prev[0].id - 20 + index)),
      ...prev,
    ])
  }

  return (
    <main style={{ padding: 20 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => setStreaming((value) => !value)}>{streaming ? "Pause" : "Stream"}</button>
        <button onClick={loadOlder}>Load older</button>
      </div>
      <div style={{ position: "relative", width: 360, marginTop: 12 }}>
        <div
          ref={ref}
          {...mergeProps(virtualizer.getRootProps(), { style: { height: 400, border: "1px solid #ccc" } })}
          aria-label="Messages"
        >
          <div {...virtualizer.getContentProps()}>
            {virtualizer.getVirtualItems().map((item) => (
              <div key={item.key} {...virtualizer.getItemProps(item)} data-testid="message">
                <p style={{ margin: 0, padding: "8px 12px", borderBottom: "1px solid #eee" }}>
                  {messages[item.index].text}
                </p>
              </div>
            ))}
          </div>
        </div>
        {sticky?.unseen && (
          <button
            style={{ position: "absolute", bottom: 12, left: "50%", translate: "-50% 0" }}
            onClick={() => virtualizer.scrollToEnd({ behavior: "smooth" })}
          >
            Jump to latest
          </button>
        )}
      </div>
      <pre>{JSON.stringify(sticky)}</pre>
    </main>
  )
}
