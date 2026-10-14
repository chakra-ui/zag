<script lang="ts">
  import { createFilter } from "@zag-js/i18n-utils"
  import { componentRoutesData, getComponentExamples } from "@zag-js/shared"
  import { ArrowRightIcon, SearchIcon } from "lucide-svelte"

  const { contains } = createFilter({ sensitivity: "base" })

  const components = componentRoutesData.map((item) => {
    const examples = getComponentExamples(item.slug)
    return { ...item, href: examples[0]?.path ?? `/${item.slug}`, count: examples.length }
  })

  let query = $state("")
  const filtered = $derived(components.filter((item) => contains(item.label, query)))
</script>

<div class="pg-home">
  <div class="pg-home-inner">
    <div class="pg-hero">
      <span class="pg-eyebrow"><i aria-hidden="true"></i>Svelte playground</span>
      <h1>Zag components</h1>
      <p>
        Every state machine with live examples, controls and a state inspector. Press
        <kbd class="pg-kbd">⌘K</kbd> to jump anywhere.
      </p>
    </div>

    <label class="pg-filter">
      <SearchIcon aria-hidden="true" />
      <input
        bind:value={query}
        type="search"
        aria-label="Filter components"
        placeholder={`Filter ${components.length} components…`}
      />
    </label>

    {#if filtered.length === 0}
      <p class="pg-home-empty" role="status">No components match “{query}”</p>
    {:else}
      <ul class="pg-grid">
        {#each filtered as item (item.slug)}
          <li>
            <a href={item.href} class="pg-card">
              <strong>
                {item.label}
                <ArrowRightIcon aria-hidden="true" />
              </strong>
              <span>{item.count} {item.count === 1 ? "example" : "examples"}</span>
            </a>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>
