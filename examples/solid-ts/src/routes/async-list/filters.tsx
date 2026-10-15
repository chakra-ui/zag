import * as asyncList from "@zag-js/async-list"
import { useMachine } from "@zag-js/solid"
import { LoaderCircleIcon } from "lucide-solid"
import { createMemo, createSignal, For, Match, Switch } from "solid-js"
import "@styles/async-list.css"

interface Character {
  id: number
  name: string
  status: string
  species: string
  image: string
  location: { name: string }
}

export default function Page() {
  const [status, setStatus] = createSignal("")
  const [gender, setGender] = createSignal("")

  const service = useMachine(asyncList.machine as asyncList.Machine<Character>, () => ({
    autoReload: true,
    initialFilter: "",
    // Keep the current rows while the next filter combination loads
    keepPreviousItems: true,
    // Changing either select reloads the list
    dependencies: [status(), gender()],
    async load({ signal, filter }) {
      const params = new URLSearchParams()
      if (filter.trim()) params.set("name", filter.trim())
      if (status()) params.set("status", status())
      if (gender()) params.set("gender", gender())
      const response = await fetch(`https://rickandmortyapi.com/api/character/?${params}`, { signal })
      // The API answers 404 when nothing matches
      if (response.status === 404) return { items: [] }
      if (!response.ok) throw new Error(`Request failed (${response.status})`)
      const data = await response.json()
      return { items: data.results }
    },
  }))
  const list = createMemo(() => asyncList.connect(service))

  return (
    <main>
      <div class="async-list">
        <div class="async-list-toolbar">
          <input
            type="search"
            aria-label="Search characters"
            placeholder="Search characters…"
            onInput={(event) => list().setFilter(event.currentTarget.value)}
          />
          <select aria-label="Status" value={status()} onChange={(event) => setStatus(event.currentTarget.value)}>
            <option value="">Any status</option>
            <option value="alive">Alive</option>
            <option value="dead">Dead</option>
            <option value="unknown">Unknown</option>
          </select>
          <select aria-label="Gender" value={gender()} onChange={(event) => setGender(event.currentTarget.value)}>
            <option value="">Any gender</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="genderless">Genderless</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>

        <Switch>
          <Match when={list().error}>
            <div role="alert" class="async-list-status" data-type="error">
              Couldn’t load characters.
              <button onClick={() => list().reload()}>Retry</button>
            </div>
          </Match>
          <Match when={list().isEmpty && list().isLoading}>
            <div role="status" class="async-list-status">
              <LoaderCircleIcon class="async-list-spinner" /> Loading characters…
            </div>
          </Match>
          <Match when={list().isEmpty}>
            <div class="async-list-status">No characters match these filters</div>
          </Match>
          <Match when={true}>
            <ul class="async-list-items async-list-panel" aria-busy={list().isLoading}>
              <For each={list().items}>
                {(character) => (
                  <li>
                    <span class="async-list-person">
                      <img class="async-list-avatar" src={character.image} alt="" />
                      <span>
                        {character.name}
                        <span class="async-list-meta">{character.location.name}</span>
                      </span>
                    </span>
                    <span class="async-list-meta">
                      {character.species} · {character.status}
                    </span>
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
