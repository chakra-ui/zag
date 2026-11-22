"use client"

import * as autocomplete from "@zag-js/autocomplete"
import { createFilter } from "@zag-js/i18n-utils"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/autocomplete.css"

const topics = [
  "react hooks",
  "react server components",
  "tailwind grid",
  "tailwind colors",
  "web components",
  "vue v-model",
  "vue router",
]

const { contains } = createFilter({ sensitivity: "base" })

export default function Page() {
  const [value, setValue] = useState("")
  const [searches, setSearches] = useState<string[]>([])

  const items = topics.filter((topic) => contains(topic, value))

  const service = useMachine(autocomplete.machine, {
    id: useId(),
    collection: autocomplete.collection({ items }),
    name: "q",
    placeholder: "Search…",
    // Choosing a suggestion runs the search right away
    submitOnSelect: true,
    value,
    onValueChange: (details) => setValue(details.value),
  })

  const api = autocomplete.connect(service, normalizeProps)

  return (
    <>
      <main className="autocomplete">
        <form
          role="search"
          className="autocomplete-form"
          onSubmit={(event) => {
            event.preventDefault()
            const query = String(new FormData(event.currentTarget).get("q"))
            setSearches((prev) => [query, ...prev])
          }}
        >
          <div {...api.getRootProps()}>
            <label {...api.getLabelProps()}>Search docs</label>
            <div {...api.getControlProps()}>
              <input {...api.getInputProps()} type="search" />
            </div>
          </div>
          <button type="submit">Search</button>
        </form>

        <pre data-testid="searches">searches: {JSON.stringify(searches)}</pre>

        <div {...api.getPositionerProps()}>
          <div {...api.getContentProps()}>
            <div {...api.getEmptyProps()}>No results</div>
            <ul {...api.getListProps()}>
              {items.map((item) => (
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
