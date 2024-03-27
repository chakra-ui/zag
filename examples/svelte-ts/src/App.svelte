<script lang="ts">
  import { dataAttr } from "@zag-js/dom-query"
  import { routesData } from "@zag-js/shared"
  import { Link, Route, Router } from "svelte-routing"
  import Accordion from "./routes/accordion.svelte"
  import Avatar from "./routes/avatar.svelte"
  import Carousel from "./routes/carousel.svelte"
  import Checkbox from "./routes/checkbox.svelte"
  import Clipboard from "./routes/clipboard.svelte"
  import Collapsible from "./routes/collapsible.svelte"
  import ColorPicker from "./routes/color-picker.svelte"
  import Combobox from "./routes/combobox.svelte"
  import ContextMenu from "./routes/context-menu.svelte"
  import FloatingPanel from "./routes/floating-panel.svelte"
  import Index from "./routes/index.svelte"
  import NumberInput from "./routes/number-input.svelte"
  import PinInput from "./routes/pin-input.svelte"
  import Progress from "./routes/progress.svelte"
  import Select from "./routes/select.svelte"
  import Slider from "./routes/slider.svelte"
  import Tabs from "./routes/tabs.svelte"
  import TagsInput from "./routes/tags-input.svelte"
  import ToggleGroup from "./routes/toggle-group.svelte"

  const sortedRoutes = routesData.sort((a, b) => a.label.localeCompare(b.label))

  const paths = [
    { path: "/", component: Index },
    { path: "/accordion", component: Accordion },
    { path: "/avatar", component: Avatar },
    { path: "/carousel", component: Carousel },
    { path: "/checkbox", component: Checkbox },
    { path: "/color-picker", component: ColorPicker },
    { path: "/combobox", component: Combobox },
    { path: "/clipboard", component: Clipboard },
    { path: "/collapsible", component: Collapsible },
    { path: "/context-menu", component: ContextMenu },
    { path: "/select", component: Select },
    { path: "/floating-panel", component: FloatingPanel },
    { path: "/toggle-group", component: ToggleGroup },
    { path: "/tags-input", component: TagsInput },
    { path: "/pin-input", component: PinInput },
    { path: "/slider", component: Slider },
    { path: "/progress", component: Progress },
    { path: "/tabs", component: Tabs },
    { path: "/number-input", component: NumberInput },
  ]
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

    {#each paths as { path, component }}
      <Route {path}>
        <svelte:component this={component} />
      </Route>
    {/each}
  </div>
</Router>
