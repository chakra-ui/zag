import * as asyncList from "@zag-js/async-list"
import { useMachine } from "@zag-js/solid"
import { LoaderCircleIcon, RotateCwIcon } from "lucide-solid"
import { createMemo, For, Match, Switch } from "solid-js"
import "@styles/async-list.css"

interface Person {
  name: string
  url: string
  birth_year: string
}

export default function Page() {
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
  const list = createMemo(() => asyncList.connect(service))

  return (
    <main>
      <div class="async-list">
        <div class="async-list-toolbar">
          <button onClick={() => list().reload()} disabled={list().isLoading}>
            <RotateCwIcon /> Reload
          </button>
          <span class="async-list-meta">{list().items.length} people</span>
        </div>

        <Switch>
          <Match when={list().error}>
            <div role="alert" class="async-list-status" data-type="error">
              Couldn’t load people.
              <button onClick={() => list().reload()}>Retry</button>
            </div>
          </Match>
          <Match when={list().isEmpty && list().isLoading}>
            <div role="status" class="async-list-status">
              <LoaderCircleIcon class="async-list-spinner" /> Loading people…
            </div>
          </Match>
          <Match when={true}>
            <ul class="async-list-items" aria-busy={list().isLoading}>
              <For each={list().items}>
                {(person) => (
                  <li>
                    {person.name}
                    <span class="async-list-meta">{person.birth_year}</span>
                  </li>
                )}
              </For>
            </ul>
          </Match>
        </Switch>
      </div>
    </main>
  )
}
