<script lang="ts">
  import "../../../../shared/src/style.css"
  import { afterNavigate } from "$app/navigation"
  import { page } from "$app/state"
  import { dataAttr } from "@zag-js/dom-query"
  import { componentRoutesData, getComponentByPath, isKnownComponent } from "@zag-js/shared"

  let { children } = $props()

  // e2e waits for this before interacting
  afterNavigate(() => {
    document.documentElement.dataset.ready = ""
  })

  const pathname = $derived(page.url.pathname.split("?")[0] || "/")
  const pathnameComponent = $derived(pathname.split("/").filter(Boolean)[0] ?? "")
  const currentComponent = $derived(
    getComponentByPath(pathname) ?? (isKnownComponent(pathnameComponent) ? pathnameComponent : ""),
  )
</script>

<div class="page">
  <aside class="nav">
    <header>Zagjs</header>
    {#each componentRoutesData as component}
      <a href={`/${component.slug}`} data-active={dataAttr(currentComponent === component.slug)}>
        {component.label}
      </a>
    {/each}
  </aside>

  {@render children()}
</div>
