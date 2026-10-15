"use client"

import { LoaderCircleIcon, RotateCwIcon } from "lucide-react"
import { useAsyncList } from "@/hooks/use-async-list"
import "@styles/async-list.css"

interface Person {
  name: string
  url: string
  birth_year: string
}

export default function Page() {
  const list = useAsyncList<Person>({
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

  return (
    <main>
      <div className="async-list">
        <div className="async-list-toolbar">
          <button onClick={() => list.reload()} disabled={list.isLoading}>
            <RotateCwIcon /> Reload
          </button>
          <span className="async-list-meta">{list.items.length} people</span>
        </div>

        {list.error ? (
          <div role="alert" className="async-list-status" data-type="error">
            Couldn’t load people.
            <button onClick={() => list.reload()}>Retry</button>
          </div>
        ) : list.isEmpty && list.isLoading ? (
          <div role="status" className="async-list-status">
            <LoaderCircleIcon className="async-list-spinner" /> Loading people…
          </div>
        ) : (
          <ul className="async-list-items async-list-panel" aria-busy={list.isLoading}>
            {list.items.map((person) => (
              <li key={person.url}>
                {person.name}
                <span className="async-list-meta">{person.birth_year}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
