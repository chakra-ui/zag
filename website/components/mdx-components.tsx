import { FC, useState } from "react"
import { useMDXComponent } from "next-contentlayer/hooks"
import { allSnippets } from ".contentlayer/data"

function SnippetItem({ code, hidden }) {
  const content = useMDX(code)
  return (
    <div id="snippet" hidden={hidden}>
      {content}
    </div>
  )
}

const components: Record<string, FC<Record<string, any>>> = {
  InstallSnippet(props) {
    const { package: pkg, ...rest } = props
    return (
      <pre {...rest}>{`
      npm install ${pkg}
    `}</pre>
    )
  },
  CodeSnippet(props) {
    const { id, ...rest } = props
    const [framework, setFramework] = useState("react")
    const snippets = allSnippets.filter((p) => p._id.endsWith(id))
    return (
      <div>
        <div>
          {["react", "vue", "solid"].map((f) => (
            <button onClick={() => setFramework(f)} key={f}>
              {f} {f === framework ? "x" : null}
            </button>
          ))}
        </div>
        {snippets.map((p) => (
          <SnippetItem key={p._id} code={p.body.code} hidden={p.framework !== framework} />
        ))}
      </div>
    )
  },
}

export function useMDX(code: string) {
  const MDXComponent = useMDXComponent(code)
  return <MDXComponent components={components} />
}
