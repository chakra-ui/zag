<script lang="ts">
  import Circular from "$lib/components/progress-circular.svelte"
  import Linear from "$lib/components/progress-linear.svelte"
  import "@styles/progress.css"
</script>

<!-- `null` means the amount of work is unknown -->
<main class="progress">
  <div class="vstack gap-8">
    <Linear />
    <Circular />
  </div>
</main>
