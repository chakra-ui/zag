<script lang="ts">
  import * as asyncList from "@zag-js/async-list"
  import { useMachine } from "@zag-js/svelte"
  import { LoaderCircleIcon, RotateCwIcon } from "lucide-svelte"
  import "@styles/async-list.css"

  interface Person {
    name: string
    url: string
    birth_year: string
  }

  const service = useMachine(asyncList.machine as asyncList.Machine<Person>, {
    autoReload: true,
    // Reloading dims the current rows instead of blanking them
    keepPreviousItems: true,
    async load({ signal }) {
      const response = await fetch("https://swapi.py4e.com/api/people/", { signal })
      if (!response.ok) throw new Error(`Request failed (${response.status})`)
      const data = await response.json()
      return { items: data.results }
    },
  })

  const list = $derived(asyncList.connect(service))
</script>

<main>
  <div class="async-list">
    <div class="async-list-toolbar">
      <button disabled={list.isLoading} onclick={() => list.reload()}><RotateCwIcon /> Reload</button>
      <span class="async-list-meta">{list.items.length} people</span>
    </div>

    {#if list.error}
      <div role="alert" class="async-list-status" data-type="error">
        Couldn’t load people.
        <button onclick={() => list.reload()}>Retry</button>
      </div>
    {:else if list.isEmpty && list.isLoading}
      <div role="status" class="async-list-status">
        <LoaderCircleIcon class="async-list-spinner" /> Loading people…
      </div>
    {:else}
      <ul class="async-list-items" aria-busy={list.isLoading}>
        {#each list.items as person (person.url)}
          <li>
            {person.name}
            <span class="async-list-meta">{person.birth_year}</span>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</main>
