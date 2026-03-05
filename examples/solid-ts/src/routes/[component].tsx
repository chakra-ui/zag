import { A, useParams } from "@solidjs/router"
import { componentRoutesData, getComponentExamples, isKnownComponent } from "@zag-js/shared"
import { createEffect, createMemo, createSignal, For, Show } from "solid-js"

export default function ComponentExamplesPage() {
  const params = useParams<{ component: string }>()
  const [query, setQuery] = createSignal("")

  const currentComponent = createMemo(() => params.component ?? "")
  const componentInfo = createMemo(() => componentRoutesData.find((item) => item.slug === currentComponent()))
  const examples = createMemo(() => getComponentExamples(currentComponent()))

  createEffect(() => {
    currentComponent()
    setQuery("")
  })

  const filteredExamples = createMemo(() => {
    const search = query().trim().toLowerCase()
    if (!search) return examples()
    return examples().filter((example) => example.title.toLowerCase().includes(search))
  })

  return (
    <Show
      when={isKnownComponent(currentComponent()) && componentInfo()}
      fallback={<div class="index-nav component-index-nav">Unknown component.</div>}
    >
      <div class="index-nav component-index-nav">
        <h2>
          {componentInfo()!.label} Examples ({filteredExamples().length}/{examples().length})
        </h2>

        <div class="component-search">
          <input
            aria-label={`Search ${componentInfo()!.label} examples`}
            onInput={(event) => setQuery(event.currentTarget.value)}
            placeholder="Search examples"
            type="search"
            value={query()}
          />
        </div>

        <Show when={filteredExamples().length > 0} fallback={<p class="empty-state">No examples found.</p>}>
          <ul>
            <For each={filteredExamples()}>
              {(example) => (
                <li>
                  <A href={example.path}>{example.title}</A>
                </li>
              )}
            </For>
          </ul>
        </Show>
      </div>
    </Show>
  )
}
