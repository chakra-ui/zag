<script lang="ts">
  import "@styles/global.css"
  import "@styles/playground.css"
  import { afterNavigate } from "$app/navigation"
  import Shell from "#lib/components/shell/shell.svelte"
  import { prefsHtml } from "#lib/components/shell/prefs.ts"

  let { children } = $props()

  // e2e waits for this before interacting
  afterNavigate(() => {
    document.documentElement.dataset.ready = ""
  })
</script>

<svelte:head>
  <!-- Sets saved shell prefs on <html> before first paint -->
  {@html prefsHtml}
</svelte:head>

<Shell>
  {@render children()}
</Shell>
