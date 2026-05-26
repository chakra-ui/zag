<script lang="ts">
  import DrawerControlledAlwaysOpen from "./DrawerControlledAlwaysOpen.svelte"
  import DrawerControlledManaged from "./DrawerControlledManaged.svelte"
  import styles from "../../../../../shared/styles/drawer.module.css"

  const parentId = $props.id()

  let scenario = $state<"always-open" | "controlled">("controlled")
</script>

<main style="padding: 20px">
  <div style="display: flex; gap: 8px; margin-bottom: 20px">
    <button
      class={styles.trigger}
      type="button"
      onclick={() => (scenario = "always-open")}
      style:font-weight={scenario === "always-open" ? 700 : 400}
    >
      Always Open
    </button>
    <button
      class={styles.trigger}
      type="button"
      onclick={() => (scenario = "controlled")}
      style:font-weight={scenario === "controlled" ? 700 : 400}
    >
      Controlled
    </button>
  </div>

  {#if scenario === "always-open"}
    <DrawerControlledAlwaysOpen id={`${parentId}-always`} />
  {:else}
    <DrawerControlledManaged id={`${parentId}-managed`} />
  {/if}
</main>
