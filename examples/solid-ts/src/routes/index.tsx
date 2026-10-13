import { A } from "@solidjs/router"
import { createFilter } from "@zag-js/i18n-utils"
import { componentRoutesData, getComponentExamples } from "@zag-js/shared"
import { ArrowRightIcon, SearchIcon } from "lucide-solid"
import { createMemo, createSignal, For, Show } from "solid-js"

const { contains } = createFilter({ sensitivity: "base" })

const components = componentRoutesData.map((item) => {
  const examples = getComponentExamples(item.slug)
  return { ...item, href: examples[0]?.path ?? `/${item.slug}`, count: examples.length }
})

export default function Home() {
  const [query, setQuery] = createSignal("")
  const filtered = createMemo(() => components.filter((item) => contains(item.label, query())))

  return (
    <div class="pg-home">
      <div class="pg-home-inner">
        <div class="pg-hero">
          <span class="pg-eyebrow">
            <i aria-hidden />
            Solid playground
          </span>
          <h1>Zag components</h1>
          <p>
            Every state machine with live examples, controls and a state inspector. Press <kbd class="pg-kbd">⌘K</kbd>{" "}
            to jump anywhere.
          </p>
        </div>

        <label class="pg-filter">
          <SearchIcon aria-hidden />
          <input
            type="search"
            aria-label="Filter components"
            placeholder={`Filter ${components.length} components…`}
            value={query()}
            onInput={(event) => setQuery(event.currentTarget.value)}
          />
        </label>

        <Show
          when={filtered().length > 0}
          fallback={
            <p class="pg-home-empty" role="status">
              No components match “{query()}”
            </p>
          }
        >
          <ul class="pg-grid">
            <For each={filtered()}>
              {(item) => (
                <li>
                  <A href={item.href} class="pg-card">
                    <strong>
                      {item.label}
                      <ArrowRightIcon aria-hidden />
                    </strong>
                    <span>
                      {item.count} {item.count === 1 ? "example" : "examples"}
                    </span>
                  </A>
                </li>
              )}
            </For>
          </ul>
        </Show>
      </div>
    </div>
  )
}
