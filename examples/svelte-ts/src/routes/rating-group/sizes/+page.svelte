<script lang="ts">
  import SizedRating from "#lib/components/rating-group-sized.svelte"
  import "@styles/rating-group.css"

  const sizes = [
    { label: "Small", size: "16px" },
    { label: "Medium", size: "24px" },
    { label: "Large", size: "32px" },
  ]
</script>

<main class="rating">
  <div class="vstack gap-5">
    {#each sizes as item (item.label)}
      <SizedRating {...item} />
    {/each}
  </div>
</main>
