<script lang="ts">
  import { autoResizeInput } from "@zag-js/auto-resize"
  import { onMount } from "svelte"
  import "@styles/autoresize.css"

  let inputRef: HTMLInputElement

  onMount(() => autoResizeInput(inputRef))
</script>

<main>
  <div class="autoresize-input-width">
    <label>
      <span>Board name</span>
      <input bind:this={inputRef} value="Roadmap" spellcheck={false} />
    </label>
  </div>
</main>
