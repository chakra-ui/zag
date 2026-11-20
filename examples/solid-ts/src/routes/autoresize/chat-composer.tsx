import { autoresizeTextarea } from "@zag-js/auto-resize"
import { createSignal, For, onSettled } from "solid-js"
import "@styles/autoresize.css"

export default function Page() {
  let textareaRef: HTMLTextAreaElement | undefined
  const [messages, setMessages] = createSignal(["Are we still on for 10?", "Yes, see you in the lobby"])
  const [draft, setDraft] = createSignal("")

  onSettled(() => {
    if (!textareaRef) return
    const cleanup = autoresizeTextarea(textareaRef)
    return () => {
      if (cleanup) cleanup()
    }
  })

  const send = () => {
    if (!draft().trim()) return
    setMessages((prev) => [...prev, draft()])
    setDraft("")
  }

  return (
    <main>
      <div class="autoresize-chat-composer">
        <p class="hint">Shift+Enter for a new line</p>
        <ul class="messages">
          <For each={messages()}>{(message) => <li>{message}</li>}</For>
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
            value={draft()}
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
