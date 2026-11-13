"use client"

import * as clipboard from "@zag-js/clipboard"
import { normalizeProps, useMachine } from "@zag-js/react"
import { ClipboardCheck, ClipboardCopyIcon } from "lucide-react"
import { useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/clipboard.css"

const snippets = [
  { id: "install", title: "Install", code: "pnpm add @zag-js/clipboard" },
  {
    id: "import",
    title: "Import",
    code: 'import * as clipboard from "@zag-js/clipboard"',
  },
  {
    id: "usage",
    title: "Usage",
    code: "const service = useMachine(clipboard.machine, { id: useId() })\nconst api = clipboard.connect(service, normalizeProps)",
  },
]

export default function Page() {
  const [activeId, setActiveId] = useState<string | null>(null)

  const service = useMachine(clipboard.machine, {
    id: useId(),
    timeout: 1000,
  })

  const api = clipboard.connect(service, normalizeProps)

  return (
    <>
      <main>
        <div className="code-blocks">
          <div {...api.getRootProps()}>
            {snippets.map((snippet) => {
              const copied = api.copied && activeId === snippet.id
              return (
                <div className="block" key={snippet.id}>
                  <div className="block-header">
                    <strong>{snippet.title}</strong>
                    <button
                      type="button"
                      data-copied={copied ? "" : undefined}
                      aria-label={`${copied ? "Copied!" : "Copy"} ${snippet.title} snippet`}
                      onClick={() => {
                        setActiveId(snippet.id)
                        api.setValue(snippet.code)
                        api.copy()
                      }}
                    >
                      {copied ? <ClipboardCheck /> : <ClipboardCopyIcon />}
                      <span>{copied ? "Copied!" : "Copy"}</span>
                    </button>
                  </div>
                  <pre>{snippet.code}</pre>
                </div>
              )
            })}
          </div>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
