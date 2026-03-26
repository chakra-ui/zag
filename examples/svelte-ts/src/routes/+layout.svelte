<script lang="ts">
  import "../../../shared/styles/style.module.css"
  import { page } from '$app/stores';
  import { dataAttr } from "@zag-js/dom-query"
  import { componentRoutesData, getComponentByPath, isKnownComponent } from "@zag-js/shared"

  $: pathname = $page.url.pathname.split("?")[0] || "/"
  $: pathnameComponent = pathname.split("/").filter(Boolean)[0] ?? ""
  $: currentComponent = getComponentByPath(pathname) ?? (isKnownComponent(pathnameComponent) ? pathnameComponent : "")
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

  <slot />
</div>
