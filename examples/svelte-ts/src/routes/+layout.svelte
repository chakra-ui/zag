<script lang="ts">
  import "@styles/global.css"
  import Sidebar from "$lib/components/sidebar.svelte"
</script>

<div class="page">
  <Sidebar />
  <slot />
</div>
