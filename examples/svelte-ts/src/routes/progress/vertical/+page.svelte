<script lang="ts">
  import Level from "#lib/components/progress-level.svelte"
  import "@styles/progress.css"

  const levels = [
    { label: "CPU", value: 72 },
    { label: "RAM", value: 45 },
    { label: "Disk", value: 90 },
  ]
</script>

<main class="progress">
  <div class="hstack gap-8">
    {#each levels as level (level.label)}
      <Level {...level} />
    {/each}
  </div>
</main>
