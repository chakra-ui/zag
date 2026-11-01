"use client"

import { LoaderCircleIcon } from "lucide-react"
import { useState } from "react"
import { useAsyncList } from "@/hooks/use-async-list"
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
  const [status, setStatus] = useState("")
  const [gender, setGender] = useState("")

  const list = useAsyncList<Character>({
    autoReload: true,
    initialFilter: "",
    // Keep the current rows while the next filter combination loads
    keepPreviousItems: true,
    // Changing either select reloads the list
    dependencies: [status, gender],
    async load({ signal, filter }) {
      const params = new URLSearchParams()
      if (filter.trim()) params.set("name", filter.trim())
      if (status) params.set("status", status)
      if (gender) params.set("gender", gender)
      const response = await fetch(`https://rickandmortyapi.com/api/character/?${params}`, { signal })
      // The API answers 404 when nothing matches
      if (response.status === 404) return { items: [] }
      if (!response.ok) throw new Error(`Request failed (${response.status})`)
      const data = await response.json()
      return { items: data.results }
    },
  })

  return (
    <main>
      <div className="async-list">
        <div className="async-list-toolbar">
          <input
            type="search"
            aria-label="Search characters"
            placeholder="Search characters…"
            onChange={(event) => list.setFilter(event.currentTarget.value)}
          />
          <select aria-label="Status" value={status} onChange={(event) => setStatus(event.currentTarget.value)}>
            <option value="">Any status</option>
            <option value="alive">Alive</option>
            <option value="dead">Dead</option>
            <option value="unknown">Unknown</option>
          </select>
          <select aria-label="Gender" value={gender} onChange={(event) => setGender(event.currentTarget.value)}>
            <option value="">Any gender</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="genderless">Genderless</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>

        {list.error ? (
          <div role="alert" className="async-list-status" data-type="error">
            Couldn’t load characters.
            <button onClick={() => list.reload()}>Retry</button>
          </div>
        ) : list.isEmpty && list.isLoading ? (
          <div role="status" className="async-list-status">
            <LoaderCircleIcon className="async-list-spinner" /> Loading characters…
          </div>
        ) : list.isEmpty ? (
          <div className="async-list-status">No characters match these filters</div>
        ) : (
          <ul className="async-list-items async-list-panel" aria-busy={list.isLoading}>
            {list.items.map((character) => (
              <li key={character.id}>
                <span className="async-list-person">
                  <img className="async-list-avatar" src={character.image} alt="" />
                  <span>
                    {character.name}
                    <span className="async-list-meta">{character.location.name}</span>
                  </span>
                </span>
                <span className="async-list-meta">
                  {character.species} · {character.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
