<script lang="ts">
  import { autoresizeTextarea } from "@zag-js/auto-resize"
  import { onMount } from "svelte"

  let textareaRef: HTMLTextAreaElement

  onMount(() => {
    return autoresizeTextarea(textareaRef)
  })
</script>

<main>
  <textarea
    bind:this={textareaRef}
    rows={4}
    style="width: 100%; resize: none; padding: 20px; scroll-padding-block: 20px; max-height: 180px"
  ></textarea>
</main>
