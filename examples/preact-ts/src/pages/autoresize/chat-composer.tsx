import { autoresizeTextarea } from "@zag-js/auto-resize"
import { useEffect, useRef, useState } from "preact/hooks"
import "@styles/autoresize.css"

const initialMessages = ["Are we still on for 10?", "Yes, see you in the lobby"]

export default function Page() {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [messages, setMessages] = useState(initialMessages)
  const [draft, setDraft] = useState("")

  useEffect(() => autoresizeTextarea(textareaRef.current), [])

  const send = () => {
    if (!draft.trim()) return
    setMessages((prev) => [...prev, draft])
    setDraft("")
  }

  return (
    <main>
      <div className="autoresize-chat-composer">
        <p className="hint">Shift+Enter adds a line, Enter sends. The box stops growing at five rows.</p>
        <ul className="messages" data-testid="messages">
          {messages.map((message, index) => (
            <li key={index}>{message}</li>
          ))}
        </ul>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            send()
          }}
        >
          <textarea
            ref={textareaRef}
            rows={1}
            aria-label="Message"
            placeholder="Write a message"
            value={draft}
            onInput={(event) => setDraft(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter" || event.shiftKey || event.isComposing) return
              event.preventDefault()
              send()
            }}
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </main>
  )
}
