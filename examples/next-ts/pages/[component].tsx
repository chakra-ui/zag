import { componentRoutesData, getComponentExamples } from "@zag-js/shared"
import { GetStaticPaths, GetStaticProps } from "next"
import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect, useMemo, useState } from "react"

type Props = {
  component: string
}

export default function ComponentExamplesPage({ component }: Props) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const currentComponent = typeof router.query.component === "string" ? router.query.component : component

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

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    fallback: false,
    paths: componentRoutesData.map((component) => ({ params: { component: component.slug } })),
  }
}

export const getStaticProps: GetStaticProps<Props> = async (context) => {
  return {
    props: {
      component: String(context.params?.component ?? ""),
    },
  }
}
