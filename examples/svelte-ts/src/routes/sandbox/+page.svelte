<script lang="ts">
  import Popover from "$lib/components/popover.svelte"

  let visible = $state(false)
</script>

<main>
  <button onclick={() => (visible = !visible)}>Toggle</button>
  {#if visible}
    <Popover>
      <div>Hello</div>
    </Popover>
  {/if}
</main>
