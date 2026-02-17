<script>
  import { goto } from "$app/navigation"
  import { onMount } from "svelte"

  onMount(() => {
    goto("/switch")
  })
</script>

<p>Redirecting to switch page...</p>
