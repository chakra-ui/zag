<script lang="ts">
  import { routesData } from "@zag-js/shared"
  import { Link } from "svelte-routing"
</script>

<div class="index-nav">
  <h2>Svelte UI Machines</h2>
  <ul>
    {#each routesData as route}
      <li>
        <Link to={route.path}>{route.label}</Link>
      </li>
    {/each}
  </ul>
</div>
