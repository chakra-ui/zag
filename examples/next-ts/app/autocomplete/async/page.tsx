"use client"

import * as autocomplete from "@zag-js/autocomplete"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import { useAsyncList } from "@/hooks/use-async-list"
import "@styles/autocomplete.css"

const cities = [
  "Amsterdam",
  "Athens",
  "Barcelona",
  "Berlin",
  "Boston",
  "Brussels",
  "Buenos Aires",
  "Cairo",
  "Chicago",
  "Copenhagen",
  "Dublin",
  "Lisbon",
  "London",
  "Los Angeles",
  "Madrid",
  "Paris",
  "Prague",
  "Rome",
  "Seoul",
  "Tokyo",
]

// A fake server: slow, and aborted when the query changes
function searchCities(query: string, signal?: AbortSignal) {
  return new Promise<string[]>((resolve, reject) => {
    const timer = setTimeout(() => {
      const needle = query.trim().toLowerCase()
      resolve(cities.filter((city) => city.toLowerCase().startsWith(needle)))
    }, 600)
    signal?.addEventListener("abort", () => {
      clearTimeout(timer)
      reject(new DOMException("Aborted", "AbortError"))
    })
  })
}

export default function Page() {
  const list = useAsyncList<string>({
    // Keep showing the last results while the next query loads
    keepPreviousItems: true,
    async load({ signal, filter }) {
      if (!filter?.trim()) return { items: [] }
      return { items: await searchCities(filter, signal) }
    },
  })

  const service = useMachine(autocomplete.machine, {
    id: useId(),
    collection: autocomplete.collection({ items: list.items }),
    placeholder: "e.g. Paris",
    loading: list.isLoading,
    onValueChange({ value, reason }) {
      // Picking a city fills the input; that shouldn't trigger a search
      if (reason === "item-select") return
      list.setFilter(value)
    },
  })

  const api = autocomplete.connect(service, normalizeProps)

  return (
    <>
      <main className="autocomplete">
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>City</label>
          <div {...api.getControlProps()}>
            <input {...api.getInputProps()} />
          </div>
        </div>

        <div {...api.getPositionerProps()}>
          <div {...api.getContentProps()}>
            {list.isLoading && list.isEmpty ? (
              <div className="autocomplete-status">Searching…</div>
            ) : (
              <div {...api.getEmptyProps()}>No cities found</div>
            )}
            <ul {...api.getListProps()}>
              {list.items.map((item) => (
                <li key={item} {...api.getItemProps({ item })}>
                  <span {...api.getItemTextProps({ item })}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
