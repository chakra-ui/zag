<script lang="ts">
  import { autoresizeTextarea } from "@zag-js/auto-resize"
  import { onMount } from "svelte"
  import "@styles/autoresize.css"

  let textareaRef: HTMLTextAreaElement
  let messages = $state(["Are we still on for 10?", "Yes, see you in the lobby"])
  let draft = $state("")

  onMount(() => autoresizeTextarea(textareaRef))

  function send() {
    if (!draft.trim()) return
    messages = [...messages, draft]
    draft = ""
  }

  function onkeydown(event: KeyboardEvent) {
    if (event.key !== "Enter" || event.shiftKey || event.isComposing) return
    event.preventDefault()
    send()
  }
</script>

<main>
  <div class="autoresize-chat-composer">
    <p class="hint">Shift+Enter adds a line, Enter sends. The box stops growing at five rows.</p>
    <ul class="messages" data-testid="messages">
      {#each messages as message, index (index)}
        <li>{message}</li>
      {/each}
    </ul>
    <form
      onsubmit={(event) => {
        event.preventDefault()
        send()
      }}
    >
      <textarea
        bind:this={textareaRef}
        rows={1}
        aria-label="Message"
        placeholder="Write a message"
        value={draft}
        oninput={(event) => (draft = event.currentTarget.value)}
        {onkeydown}></textarea>
      <button type="submit">Send</button>
    </form>
  </div>
</main>
