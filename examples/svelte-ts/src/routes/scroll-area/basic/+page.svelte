<script lang="ts">
  import styles from "../../../../../../shared/src/css/scroll-area.module.css"
  import * as scrollArea from "@zag-js/scroll-area"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"

  const id = $props.id()
  const service = useMachine(scrollArea.machine, { id })

  const api = $derived(scrollArea.connect(service, normalizeProps))
</script>

<main class="scroll-area">
  <button onclick={() => api.scrollToEdge({ edge: "bottom" })}>Scroll to bottom</button>
  <div {...api.getRootProps()} class={styles.Root}>
    <div {...api.getViewportProps()} class={styles.Viewport}>
      <div {...api.getContentProps()} class={styles.Content}>
        {#each Array.from({ length: 100 }) as _, index}
          <div>{index}</div>
        {/each}
      </div>
    </div>
    {#if api.hasOverflowY}
      <div {...api.getScrollbarProps()} class={styles.Scrollbar}>
        <div {...api.getThumbProps()} class={styles.Thumb}></div>
      </div>
    {/if}
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>