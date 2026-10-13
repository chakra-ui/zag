"use client"

import { createFilter } from "@zag-js/i18n-utils"
import { componentRoutesData, getComponentExamples } from "@zag-js/shared"
import { ArrowRightIcon, SearchIcon } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

const { contains } = createFilter({ sensitivity: "base" })

const components = componentRoutesData.map((item) => {
  const examples = getComponentExamples(item.slug)
  return { ...item, href: examples[0]?.path ?? `/${item.slug}`, count: examples.length }
})

export default function Page() {
  const [query, setQuery] = useState("")
  const filtered = useMemo(() => components.filter((item) => contains(item.label, query)), [query])

  return (
    <div className="pg-home">
      <div className="pg-home-inner">
        <div className="pg-hero">
          <span className="pg-eyebrow">
            <i aria-hidden />
            React playground
          </span>
          <h1>Zag components</h1>
          <p>
            Every state machine with live examples, controls and a state inspector. Press{" "}
            <kbd className="pg-kbd">⌘K</kbd> to jump anywhere.
          </p>
        </div>

        <label className="pg-filter">
          <SearchIcon aria-hidden />
          <input
            type="search"
            aria-label="Filter components"
            placeholder={`Filter ${components.length} components…`}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        {filtered.length === 0 ? (
          <p className="pg-home-empty" role="status">
            No components match “{query}”
          </p>
        ) : (
          <ul className="pg-grid">
            {filtered.map((item) => (
              <li key={item.slug}>
                <Link href={item.href} className="pg-card">
                  <strong>
                    {item.label}
                    <ArrowRightIcon aria-hidden />
                  </strong>
                  <span>
                    {item.count} {item.count === 1 ? "example" : "examples"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
