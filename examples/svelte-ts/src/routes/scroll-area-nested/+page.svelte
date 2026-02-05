<script lang="ts">
  import ScrollArea from "$lib/components/scroll-area.svelte"
</script>

<main class="scroll-area">
  <ScrollArea style="height: 500px; width: 800px">
    {#each Array.from({ length: 5 }) as _, outerIndex (outerIndex)}
      <ScrollArea style="max-height: 200px">
        {#each Array.from({ length: 100 }) as _, index (index)}
          <div>{index}</div>
        {/each}
      </ScrollArea>
    {/each}
  </ScrollArea>
</main>
