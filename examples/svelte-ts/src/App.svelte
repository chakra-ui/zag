<script lang="ts">
  import { dataAttr } from "@zag-js/dom-query"
  import { routesData } from "@zag-js/shared"
  import { Link, Route, Router } from "svelte-routing"

  const sortedRoutes = routesData.sort((a, b) => a.label.localeCompare(b.label))

  const paths: Array<{ path: string; component: any }> = [
    { path: "/", component: () => import("./routes/index.svelte") },
    { path: "/sandbox", component: () => import("./routes/sandbox.svelte") },
    { path: "/accordion", component: () => import("./routes/accordion.svelte") },
    { path: "/async-list", component: () => import("./routes/async-list.svelte") },
    { path: "/avatar", component: () => import("./routes/avatar.svelte") },
    { path: "/angle-slider", component: () => import("./routes/angle-slider.svelte") },
    { path: "/carousel", component: () => import("./routes/carousel.svelte") },
    { path: "/checkbox", component: () => import("./routes/checkbox.svelte") },
    { path: "/clipboard", component: () => import("./routes/clipboard.svelte") },
    { path: "/collapsible", component: () => import("./routes/collapsible.svelte") },
    { path: "/color-picker", component: () => import("./routes/color-picker.svelte") },
    { path: "/combobox", component: () => import("./routes/combobox.svelte") },
    { path: "/context-menu", component: () => import("./routes/context-menu.svelte") },
    { path: "/date-picker", component: () => import("./routes/date-picker.svelte") },
    { path: "/date-picker-multi", component: () => import("./routes/date-picker-multi.svelte") },
    { path: "/date-picker-range", component: () => import("./routes/date-picker-range.svelte") },
    { path: "/dialog", component: () => import("./routes/dialog.svelte") },
    { path: "/editable", component: () => import("./routes/editable.svelte") },
    { path: "/file-upload", component: () => import("./routes/file-upload.svelte") },
    { path: "/floating-panel", component: () => import("./routes/floating-panel.svelte") },
    { path: "/hover-card", component: () => import("./routes/hover-card.svelte") },
    { path: "/menu-nested", component: () => import("./routes/menu-nested.svelte") },
    { path: "/menu", component: () => import("./routes/menu.svelte") },
    { path: "/menu-options", component: () => import("./routes/menu-options.svelte") },
    { path: "/number-input", component: () => import("./routes/number-input.svelte") },
    { path: "/pagination", component: () => import("./routes/pagination.svelte") },
    { path: "/pin-input", component: () => import("./routes/pin-input.svelte") },
    { path: "/popover", component: () => import("./routes/popover.svelte") },
    { path: "/progress", component: () => import("./routes/progress.svelte") },
    { path: "/range-slider", component: () => import("./routes/range-slider.svelte") },
    { path: "/radio-group", component: () => import("./routes/radio-group.svelte") },
    { path: "/rating-group", component: () => import("./routes/rating-group.svelte") },
    { path: "/scroll-area", component: () => import("./routes/scroll-area.svelte") },
    { path: "/segment-control", component: () => import("./routes/segment-control.svelte") },
    { path: "/select", component: () => import("./routes/select.svelte") },
    { path: "/splitter", component: () => import("./routes/splitter.svelte") },
    { path: "/signature-pad", component: () => import("./routes/signature-pad.svelte") },
    { path: "/slider", component: () => import("./routes/slider.svelte") },
    { path: "/switch", component: () => import("./routes/switch.svelte") },
    { path: "/tabs", component: () => import("./routes/tabs.svelte") },
    { path: "/tags-input", component: () => import("./routes/tags-input.svelte") },
    { path: "/time-picker", component: () => import("./routes/time-picker.svelte") },
    { path: "/toast-overlap", component: () => import("./routes/toast-overlap.svelte") },
    { path: "/toast-stacked", component: () => import("./routes/toast-stacked.svelte") },
    { path: "/toggle-group", component: () => import("./routes/toggle-group.svelte") },
    { path: "/tooltip", component: () => import("./routes/tooltip.svelte") },
    { path: "/tour", component: () => import("./routes/tour.svelte") },
    { path: "/tree-view", component: () => import("./routes/tree-view.svelte") },
    { path: "/timer-countdown", component: () => import("./routes/timer-countdown.svelte") },
    { path: "/timer-stopwatch", component: () => import("./routes/timer-stopwatch.svelte") },
    { path: "/qr-code", component: () => import("./routes/qr-code.svelte") },
    { path: "/presence", component: () => import("./routes/presence.svelte") },
    { path: "/popper", component: () => import("./routes/popper.svelte") },
    { path: "/steps", component: () => import("./routes/steps.svelte") },
    { path: "/listbox", component: () => import("./routes/listbox.svelte") },
    { path: "/listbox-grid", component: () => import("./routes/listbox-grid.svelte") },
    { path: "/password-input", component: () => import("./routes/password-input.svelte") },
    { path: "/json-tree", component: () => import("./routes/json-tree.svelte") },
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
        {#if typeof component === "function"}
          {#await component() then module}
            <svelte:component this={module.default} />
          {:catch error}
            <div>Error loading component: {error?.message || "Failed to load component"}</div>
          {/await}
        {:else}
          <svelte:component this={component} />
        {/if}
      </Route>
    {/each}
  </div>
</Router>
