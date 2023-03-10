<script>
  import { routesData } from "@zag-js/shared"

  const routes = routesData.sort((a, b) => a.label.localeCompare(b.label))
</script>

<div class="index-nav">
  <h2>Zag.js + React</h2>
  <ul>
    {#each routes as route}
      <li>
        <a href={route.path}>{route.label}</a>
      </li>
    {/each}
  </ul>
</div>
