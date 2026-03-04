<script lang="ts">
  import { page } from "$app/stores"
  import { componentRoutesData, getComponentExamples, isKnownComponent } from "@zag-js/shared"

  let query = ""

  $: currentComponent = String($page.params.component ?? "")
  $: componentInfo = componentRoutesData.find((item) => item.slug === currentComponent)
  $: examples = getComponentExamples(currentComponent)

  $: if ($page.params.component) {
    query = ""
  }

  $: filteredExamples = (() => {
    const search = query.trim().toLowerCase()
    if (!search) return examples
    return examples.filter((example) => example.title.toLowerCase().includes(search))
  })()
</script>

{#if isKnownComponent(currentComponent) && componentInfo}
  <div class="index-nav component-index-nav">
    <h2>{componentInfo.label} Examples ({filteredExamples.length}/{examples.length})</h2>

    <div class="component-search">
      <input
        aria-label={`Search ${componentInfo.label} examples`}
        bind:value={query}
        placeholder="Search examples"
        type="search"
      />
    </div>

    {#if filteredExamples.length > 0}
      <ul>
        {#each filteredExamples as example}
          <li>
            <a href={example.path}>{example.title}</a>
          </li>
        {/each}
      </ul>
    {:else}
      <p class="empty-state">No examples found.</p>
    {/if}
  </div>
{:else}
  <div class="index-nav component-index-nav">Unknown component.</div>
{/if}
