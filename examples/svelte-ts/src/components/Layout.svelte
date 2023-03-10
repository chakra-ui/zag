<script lang="ts">
  // The country-list package used in shared prevents us from using the zag-shared package, because it uses require, and sveltekit has issues with that
  import "../../../../shared/src/style.css"
  import { routesData } from "@zag-js/shared"
  import { dataAttr } from "@zag-js/dom-query"
  import { Router, Link, link } from "svelte-navigator"

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
