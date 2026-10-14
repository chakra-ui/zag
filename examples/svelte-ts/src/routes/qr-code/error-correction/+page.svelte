<script lang="ts">
  import Level from "$lib/components/qr-code-level.svelte"
  import "@styles/qr-code.css"

  type Ecc = "L" | "M" | "Q" | "H"

  // Higher levels add redundancy: the same value needs more modules
  const levels: { ecc: Ecc; recovery: string }[] = [
    { ecc: "L", recovery: "~7% recoverable" },
    { ecc: "M", recovery: "~15% recoverable" },
    { ecc: "Q", recovery: "~25% recoverable" },
    { ecc: "H", recovery: "~30% recoverable" },
  ]
</script>

<main class="qr-code">
  <div class="hstack gap-5">
    {#each levels as level (level.ecc)}
      <Level {...level} />
    {/each}
  </div>
</main>
