<script>
  import routes from "./router/routes"
  import Layout from "./components/Layout.svelte"
  import { Route } from 'svelte-navigator';
</script>

<Layout>
  {#each routes as route}
    <Route path={route.path}>
      <svelte:component this={route.component} />
    </Route>
  {/each}
</Layout>
