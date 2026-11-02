<script lang="ts">
  import Menu from "#lib/components/menu-detached-menu.svelte"
  import "@styles/menu.css"
</script>

<main style="height: 100vh; display: flex; justify-content: center; align-items: center; gap: 40px">
  <div style="display: flex; justify-content: center; align-items: center">
    <div
      style="display: flex; width: 300px; height: 100%; overflow-x: scroll; column-gap: 24px; flex-shrink: 0; padding: 16px; border: 1px solid #ccc; background-color: #f0f0f0"
    >
      {#each [...Array(6).keys()] as x (x)}
        <div style="background-color: lightgray; border-radius: 4px; padding: 16px; white-space: nowrap">
          Item {x}
        </div>
      {/each}
      <div>
        <Menu />
      </div>
    </div>
  </div>

  <div style="background-color: #ffffff; border: 1px solid black">
    <div
      style="display: flex; flex-direction: column; gap: 16px; align-items: center; max-height: 200px; width: 200px; overflow-y: auto; border: 1px solid black"
    >
      {#each [...Array(12).keys()] as x (x)}
        <Menu />
      {/each}
    </div>
  </div>
</main>
