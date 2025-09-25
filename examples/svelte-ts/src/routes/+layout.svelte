<script lang="ts">
  import "../../../../shared/src/style.css"
  import { page } from '$app/stores';
  import { dataAttr } from "@zag-js/dom-query"
  import { routesData } from "@zag-js/shared"

  const sortedRoutes = routesData.sort((a, b) => a.label.localeCompare(b.label))
</script>

<div class="page">
  <aside class="nav">
    <header>Zagjs</header>
    {#each sortedRoutes as route}
      <a href={route.path} data-active={dataAttr($page.url.pathname === route.path)}>
        {route.label}
      </a>
    {/each}
  </aside>

  <slot />
</div>