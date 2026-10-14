<script lang="ts">
  import "@styles/global.css"
  import "@styles/playground.css"
  import Shell from "$lib/components/shell/shell.svelte"
  import { prefsHtml } from "$lib/components/shell/prefs"

  let { children } = $props()
</script>

<svelte:head>
  <!-- Sets saved shell prefs on <html> before first paint -->
  {@html prefsHtml}
</svelte:head>

<Shell>
  {@render children()}
</Shell>
