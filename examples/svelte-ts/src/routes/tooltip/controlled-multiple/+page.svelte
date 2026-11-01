<script lang="ts">
  import TooltipDemo from "#lib/components/tooltip-controlled-item.svelte"
  import "@styles/tooltip.css"
</script>

<div style="padding: 40px; height: 200vh">
  <h1>Tooltip Controlled (Multiple)</h1>
  <div style="display: flex; flex-direction: column; gap: 4px">
    {#each Array.from({ length: 10 }) as _, index (index)}
      <TooltipDemo />
    {/each}
  </div>
</div>
