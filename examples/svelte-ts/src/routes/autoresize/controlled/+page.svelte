<script lang="ts">
  import { autoresizeTextarea } from "@zag-js/auto-resize"
  import { onMount } from "svelte"

  let textareaRef: HTMLTextAreaElement
  let value = $state("")

  onMount(() => {
    return autoresizeTextarea(textareaRef)
  })

  const handleChange = (e: Event & { currentTarget: HTMLTextAreaElement }) => {
    console.log("onChange fired:", e.currentTarget.value)
    value = e.currentTarget.value
  }

  const handleClear = () => {
    console.log("Clear button clicked")
    value = ""
  }
</script>

<main style="padding: 20px; max-width: 600px">
  <h1>Autoresize Controlled Textarea</h1>
  <p>Test: Type a character, click Clear, then type the same character again. The onChange should fire each time.</p>

  <textarea
    bind:this={textareaRef}
    {value}
    oninput={handleChange}
    placeholder="Type something..."
    rows={2}
    style="width: 100%; resize: none; padding: 12px; font-size: 16px; border-radius: 8px; border: 1px solid #ccc"
  ></textarea>

  <div style="margin-top: 12px; display: flex; gap: 12px">
    <button onclick={handleClear} style="padding: 8px 16px; font-size: 14px; cursor: pointer">Clear the field</button>
  </div>

  <div style="margin-top: 20px">
    <strong>Value from state:</strong>
    <pre
      data-testid="value"
      style="background: #f5f5f5; padding: 12px; border-radius: 4px; min-height: 40px">{JSON.stringify(value)}</pre>
  </div>

  <div style="margin-top: 20px; color: #666; font-size: 14px">
    <strong>Instructions:</strong>
    <ol>
      <li>Type any single character (e.g., "a")</li>
      <li>Click "Clear the field" button</li>
      <li>Type the same character again</li>
      <li>
        <strong>Expected:</strong> onChange fires, state updates to "a"
      </li>
      <li>
        <strong>Bug (before fix):</strong> onChange doesn't fire, state stays empty
      </li>
    </ol>
    <p>Check the browser console for onChange logs.</p>
  </div>
</main>
