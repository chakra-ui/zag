"use client"

import * as autocomplete from "@zag-js/autocomplete"
import { createFilter } from "@zag-js/i18n-utils"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/autocomplete.css"

const recent = ["react hooks", "tailwind grid", "web components", "vue v-model"]
const topics = [...recent, "react server components", "tailwind colors", "vue router"]

const { contains } = createFilter({ sensitivity: "base" })

export default function Page() {
  const [value, setValue] = useState("")

  // An empty input shows recent searches; typing searches every topic
  const showRecent = value.trim() === ""
  const items = showRecent ? recent : topics.filter((topic) => contains(topic, value))

  const service = useMachine(autocomplete.machine, {
    id: useId(),
    collection: autocomplete.collection({ items }),
    placeholder: "Search docs…",
    openOnClick: true,
    value,
    onValueChange: (details) => setValue(details.value),
    translations: {
      resultsCount: (count) => `${count} ${count === 1 ? "topic" : "topics"}`,
    },
  })

  const api = autocomplete.connect(service, normalizeProps)

  const renderItem = (item: string) => (
    <li key={item} {...api.getItemProps({ item })}>
      <span {...api.getItemTextProps({ item })}>{item}</span>
    </li>
  )

  return (
    <>
      <main className="autocomplete">
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>Search docs</label>
          <div {...api.getControlProps()}>
            <input {...api.getInputProps()} type="search" />
          </div>
        </div>

        <div {...api.getPositionerProps()}>
          <div {...api.getContentProps()}>
            <div {...api.getEmptyProps()}>No topics found</div>
            <ul {...api.getListProps()}>
              {showRecent ? (
                <li {...api.getItemGroupProps({ id: "recent" })}>
                  <span {...api.getItemGroupLabelProps({ htmlFor: "recent" })}>Recent searches</span>
                  <ul role="presentation">{items.map(renderItem)}</ul>
                </li>
              ) : (
                items.map(renderItem)
              )}
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
