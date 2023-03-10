<script lang="ts">
  import "@zag-js/shared/src/style.css"
  import { routesData } from "@zag-js/shared"
  import { Router, Link } from "svelte-navigator"

  const routes = routesData.sort((a, b) => a.label.localeCompare(b.label))
</script>

<svelte:head>
  <title>Svelte Machines</title>
</svelte:head>
<Router>
  <div class="page">
    <aside class="nav">
      <header>Zagjs</header>
      {#each routes as route}
        <Link to={route.path}>
          {route.label}
        </Link>
      {/each}
    </aside>
    <slot />
  </div>
</Router>
