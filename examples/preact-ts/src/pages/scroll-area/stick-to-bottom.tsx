import { normalizeProps, useMachine } from "@zag-js/preact"
import * as scrollArea from "@zag-js/scroll-area"
import { trackStickToBottom, type StickToBottom, type StickToBottomDetails } from "@zag-js/dom-query/scroll"
import { useEffect, useId, useRef, useState } from "preact/hooks"
import { Toolbar } from "../../components/toolbar"
import "@styles/scroll-area.css"

const createMessage = (id: number) => ({ id, text: `Message ${id}` })

export default function Page() {
  const [messages, setMessages] = useState(() => Array.from({ length: 20 }, (_, index) => createMessage(index + 1)))
  const [streaming, setStreaming] = useState(true)

  const service = useMachine(scrollArea.machine, { id: useId() })
  const api = scrollArea.connect(service, normalizeProps)

  const viewportRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const stickyRef = useRef<StickToBottom | null>(null)
  const [sticky, setSticky] = useState<StickToBottomDetails>({ following: true, atBottom: true, unseen: false })

  useEffect(() => {
    if (!viewportRef.current) return
    const tracker = trackStickToBottom(viewportRef.current, { content: contentRef.current, onChange: setSticky })
    stickyRef.current = tracker
    return tracker.cleanup
  }, [])

  useEffect(() => {
    if (!streaming) return
    const timer = setInterval(() => {
      setMessages((prev) => [...prev, createMessage(prev[prev.length - 1].id + 1)])
    }, 800)
    return () => clearInterval(timer)
  }, [streaming])

  const loadOlder = () => {
    setMessages((prev) => [...Array.from({ length: 5 }, (_, index) => createMessage(prev[0].id - 5 + index)), ...prev])
  }

  return (
    <>
      <main className="scroll-area">
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setStreaming((value) => !value)}>{streaming ? "Pause" : "Stream"}</button>
          <button onClick={loadOlder}>Load older</button>
        </div>
        <div {...api.getRootProps()} style={{ height: 320, position: "relative" }}>
          <div {...api.getViewportProps()} ref={viewportRef} data-following={sticky.following || undefined}>
            <div {...api.getContentProps()} ref={contentRef}>
              {messages.map((message) => (
                <p key={message.id} data-testid="message">
                  {message.text}
                </p>
              ))}
            </div>
          </div>
          {api.hasOverflowY && (
            <div {...api.getScrollbarProps({ orientation: "vertical" })}>
              <div {...api.getThumbProps({ orientation: "vertical" })} />
            </div>
          )}
          {sticky.unseen && (
            <button
              style={{ position: "absolute", bottom: 12, left: "50%", translate: "-50% 0" }}
              onClick={() => stickyRef.current?.scrollToBottom({ behavior: "smooth" })}
            >
              Jump to latest
            </button>
          )}
        </div>
      </main>

      <Toolbar>
        <pre>{JSON.stringify(sticky, null, 2)}</pre>
      </Toolbar>
    </>
  )
}
