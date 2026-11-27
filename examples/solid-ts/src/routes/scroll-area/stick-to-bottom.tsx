import { trackStickToBottom, type StickToBottom, type StickToBottomDetails } from "@zag-js/dom-query/scroll"
import * as scrollArea from "@zag-js/scroll-area"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createTrackedEffect, createUniqueId, For, onSettled, Show } from "solid-js"
import { Toolbar } from "../../components/toolbar"
import "@styles/scroll-area.css"

const createMessage = (id: number) => ({ id, text: `Message ${id}` })

export default function Page() {
  const [messages, setMessages] = createSignal(Array.from({ length: 20 }, (_, index) => createMessage(index + 1)))
  const [streaming, setStreaming] = createSignal(true)
  const [sticky, setSticky] = createSignal<StickToBottomDetails>({ following: true, atBottom: true, unseen: false })

  const service = useMachine(scrollArea.machine, { id: createUniqueId() })
  const api = createMemo(() => scrollArea.connect(service, normalizeProps))

  let viewportEl: HTMLDivElement | undefined
  let contentEl: HTMLDivElement | undefined
  let tracker: StickToBottom | null = null

  onSettled(() => {
    if (!viewportEl) return
    tracker = trackStickToBottom(viewportEl, { content: contentEl, onChange: setSticky })
    return () => tracker?.cleanup()
  })

  createTrackedEffect(() => {
    if (!streaming()) return
    const timer = setInterval(() => {
      setMessages((prev) => [...prev, createMessage(prev[prev.length - 1].id + 1)])
    }, 800)
    return () => clearInterval(timer)
  })

  const loadOlder = () => {
    setMessages((prev) => [...Array.from({ length: 5 }, (_, index) => createMessage(prev[0].id - 5 + index)), ...prev])
  }

  return (
    <>
      <main class="scroll-area">
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => setStreaming((value) => !value)}>{streaming() ? "Pause" : "Stream"}</button>
          <button onClick={loadOlder}>Load older</button>
        </div>
        <div {...api().getRootProps()} style={{ height: "320px", position: "relative" }}>
          <div ref={viewportEl} {...api().getViewportProps()} data-following={sticky().following || undefined}>
            <div ref={contentEl} {...api().getContentProps()}>
              <For each={messages()}>{(message) => <p data-testid="message">{message.text}</p>}</For>
            </div>
          </div>
          <Show when={api().hasOverflowY}>
            <div {...api().getScrollbarProps({ orientation: "vertical" })}>
              <div {...api().getThumbProps({ orientation: "vertical" })} />
            </div>
          </Show>
          <Show when={sticky().unseen}>
            <button
              style={{ position: "absolute", bottom: "12px", left: "50%", translate: "-50% 0" }}
              onClick={() => tracker?.scrollToBottom({ behavior: "smooth" })}
            >
              Jump to latest
            </button>
          </Show>
        </div>
      </main>

      <Toolbar>
        <pre>{JSON.stringify(sticky(), null, 2)}</pre>
      </Toolbar>
    </>
  )
}
