import { Fragment, type ReactNode } from "react"
import { refractor } from "refractor/core"
import bash from "refractor/bash"
import css from "refractor/css"
import tsx from "refractor/tsx"
import { codePanel, type CodePanelVariantProps } from "styled-system/recipes"

refractor.register(tsx)
refractor.register(css)
refractor.register(bash)

type HastNode =
  | { type: "text"; value: string }
  | {
      type: "element"
      properties?: { className?: string[] }
      children: HastNode[]
    }

function render(nodes: HastNode[]): ReactNode {
  return nodes.map((node, i) =>
    node.type === "text" ? (
      <Fragment key={i}>{node.value}</Fragment>
    ) : (
      <span key={i} className={node.properties?.className?.join(" ")}>
        {render(node.children)}
      </span>
    ),
  )
}

export interface CodePanelProps extends CodePanelVariantProps {
  file?: string
  code: string
  language: "tsx" | "css" | "bash"
  highlight?: number[]
  note?: string
}

export function CodePanel(props: CodePanelProps) {
  const { file, code, language, highlight = [], note, tone } = props
  const styles = codePanel({ tone })
  const lines = code.replace(/\n$/, "").split("\n")
  return (
    <div className={styles.root}>
      {file && <p className={styles.file}>{file}</p>}
      <pre className={`${styles.pre} language-${language}`}>
        <code className={`language-${language}`}>
          {lines.map((line, i) => {
            const active = highlight.includes(i + 1)
            return (
              <div
                key={i}
                className={styles.line}
                data-active={active || undefined}
              >
                <span className={styles.text}>
                  {line === ""
                    ? " "
                    : render(
                        refractor.highlight(line, language)
                          .children as HastNode[],
                      )}
                </span>
                {note && i + 1 === highlight[0] && (
                  <span className={styles.note}>{note}</span>
                )}
              </div>
            )
          })}
        </code>
      </pre>
    </div>
  )
}
