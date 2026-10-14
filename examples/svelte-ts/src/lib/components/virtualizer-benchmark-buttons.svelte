<script lang="ts">
  interface Props {
    counts?: number[]
    onrun: (scrollCount: number) => void
  }

  const { counts = [100, 500, 1000], onrun }: Props = $props()
</script>

<div style="display: flex; gap: 8px; margin-bottom: 12px">
  {#each counts as count (count)}
    <button style="padding: 6px 12px; border-radius: 4px; cursor: pointer" onclick={() => onrun(count)}>
      {count} scrolls
    </button>
  {/each}
</div>
