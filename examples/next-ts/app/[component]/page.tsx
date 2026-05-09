"use client"

import { componentRoutesData, getComponentExamples } from "@zag-js/shared"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

export default function ComponentExamplesPage() {
  const params = useParams<{ component: string }>()
  const currentComponent = typeof params?.component === "string" ? params.component : ""
  const [query, setQuery] = useState("")

  const componentInfo = componentRoutesData.find((item) => item.slug === currentComponent)
  const examples = useMemo(() => getComponentExamples(currentComponent), [currentComponent])

  useEffect(() => {
    setQuery("")
  }, [currentComponent])

  const filteredExamples = useMemo(() => {
    const search = query.trim().toLowerCase()
    if (!search) return examples
    return examples.filter((example) => example.title.toLowerCase().includes(search))
  }, [examples, query])

  if (!componentInfo) return null

  return (
    <div className="index-nav component-index-nav">
      <h2>
        {componentInfo.label} Examples ({filteredExamples.length}/{examples.length})
      </h2>

      <div className="component-search">
        <input
          aria-label={`Search ${componentInfo.label} examples`}
          onChange={(event) => setQuery(event.currentTarget.value)}
          placeholder="Search examples"
          type="search"
          value={query}
        />
      </div>

      {filteredExamples.length > 0 ? (
        <ul>
          {filteredExamples.map((example) => (
            <li key={example.path}>
              <Link href={example.path}>{example.title}</Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-state">No examples found.</p>
      )}
    </div>
  )
}
