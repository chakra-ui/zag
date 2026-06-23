import { componentRoutesData, getComponentExamples, isKnownComponent } from "@zag-js/shared"
import { useEffect, useMemo, useState } from "preact/hooks"
import { useRoute } from "preact-iso"

export default function ComponentExamplesPage() {
  const route = useRoute()
  const currentComponent = route.params?.component ?? ""
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

  if (!isKnownComponent(currentComponent) || !componentInfo) {
    return <div class="index-nav component-index-nav">Unknown component.</div>
  }

  return (
    <div class="index-nav component-index-nav">
      <h2>
        {componentInfo.label} Examples ({filteredExamples.length}/{examples.length})
      </h2>

      <div class="component-search">
        <input
          aria-label={`Search ${componentInfo.label} examples`}
          onInput={(event) => setQuery(event.currentTarget.value)}
          placeholder="Search examples"
          type="search"
          value={query}
        />
      </div>

      {filteredExamples.length > 0 ? (
        <ul>
          {filteredExamples.map((example) => (
            <li key={example.path}>
              <a href={example.path}>{example.title}</a>
            </li>
          ))}
        </ul>
      ) : (
        <p class="empty-state">No examples found.</p>
      )}
    </div>
  )
}
