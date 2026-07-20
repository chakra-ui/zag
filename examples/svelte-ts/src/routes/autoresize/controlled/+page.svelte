<script lang="ts">
  import { autoresizeTextarea } from "@zag-js/auto-resize"
  import { onMount } from "svelte"

  let textareaRef: HTMLTextAreaElement
  let value = $state("")

  onMount(() => {
    return autoresizeTextarea(textareaRef)
  })
</script>

<main style="padding: 20px; max-width: 600px">
  <h1>Autoresize Controlled Textarea</h1>
  <p>Type a character, click Clear, then type the same character again. The value should update each time.</p>

  <textarea
    bind:this={textareaRef}
    {value}
    rows={2}
    placeholder="Type something..."
    style="width: 100%; resize: none; padding: 12px; font-size: 16px; border-radius: 8px; border: 1px solid #ccc"
    oninput={(e) => (value = e.currentTarget.value)}></textarea>

  <div style="margin-top: 12px">
    <button type="button" style="padding: 8px 16px; font-size: 14px; cursor: pointer" onclick={() => (value = "")}>
      Clear the field
    </button>
  </div>

  <div style="margin-top: 20px">
    <strong>Value from state:</strong>
    <pre
      data-testid="value"
      style="background: #f5f5f5; padding: 12px; border-radius: 4px; min-height: 40px">{JSON.stringify(value)}</pre>
  </div>
</main>
