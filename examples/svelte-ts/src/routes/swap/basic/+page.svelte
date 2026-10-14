<script lang="ts">
  import Swap from "$lib/components/swap.svelte"
  import "@styles/swap.css"

  let muted = $state(false)
</script>

<main class="swap">
  <button onclick={() => (muted = !muted)}>
    <Swap open={muted}>
      <div>Muted</div>
      {#snippet fallback()}
        <div>Unmuted</div>
      {/snippet}
    </Swap>
  </button>
</main>
