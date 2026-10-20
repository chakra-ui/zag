<script lang="ts">
  import Toaster from "$lib/components/toast-placement-toaster.svelte"
  import * as toast from "@zag-js/toast"
  import "@styles/toast.css"

  const placements: toast.Placement[] = ["top-start", "top", "top-end", "bottom-start", "bottom", "bottom-end"]

  const toasters = new Map(placements.map((placement) => [placement, toast.createStore({ placement })]))
</script>

<main>
  <div class="hstack">
    {#each placements as placement (placement)}
      <button onclick={() => toasters.get(placement)!.create({ title: `Toast at ${placement}` })}>{placement}</button>
    {/each}
  </div>
  {#each placements as placement (placement)}
    <Toaster store={toasters.get(placement)!} />
  {/each}
</main>
