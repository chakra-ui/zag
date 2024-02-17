<script lang="ts">
  import { Router, Link, Route } from "svelte-routing"
  import { dataAttr } from "@zag-js/dom-query"
  import { routesData } from "@zag-js/shared"
  import Accordion from "./routes/accordion.svelte"
  import Index from "./routes/index.svelte"
  import Avatar from "./routes/avatar.svelte"
  import Carousel from "./routes/carousel.svelte"
  import Checkbox from "./routes/checkbox.svelte"
  import ColorPicker from "./routes/color-picker.svelte"
  import Combobox from "./routes/combobox.svelte"
  import Clipboard from "./routes/clipboard.svelte"

  const sortedRoutes = routesData.sort((a, b) => a.label.localeCompare(b.label))
</script>

<Router>
  <div class="page">
    <aside class="nav">
      <header>Zagjs</header>
      {#each sortedRoutes as route}
        <Link getProps={({ isCurrent }) => ({ "data-active": dataAttr(isCurrent) })} to={route.path}>
          {route.label}
        </Link>
      {/each}
    </aside>

    <Route path="/">
      <Index />
    </Route>
    <Route path="/accordion">
      <Accordion />
    </Route>
    <Route path="/avatar">
      <Avatar />
    </Route>
    <Route path="/carousel">
      <Carousel />
    </Route>
    <Route path="/checkbox">
      <Checkbox />
    </Route>
    <Route path="/color-picker">
      <ColorPicker />
    </Route>
    <Route path="/combobox">
      <Combobox />
    </Route>
    <Route path="/clipboard">
      <Clipboard />
    </Route>
  </div>
</Router>
