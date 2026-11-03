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

function toLines(nodes: HastNode[]): HastNode[][] {
  const lines: HastNode[][] = [[]]
  for (const node of nodes) {
    const parts =
      node.type === "text"
        ? node.value
            .split("\n")
            .map((value): HastNode[] =>
              value ? [{ type: "text", value }] : [],
            )
        : toLines(node.children).map((children): HastNode[] =>
            children.length ? [{ ...node, children }] : [],
          )
    parts.forEach((part, i) => {
      if (i > 0) lines.push([])
      lines[lines.length - 1].push(...part)
    })
  }
  return lines
}

export interface CodePanelProps extends CodePanelVariantProps {
  file?: string
  code: string
  language: "tsx" | "css" | "bash"
  highlight?: number[]
  notes?: Record<number, string>
}

export function CodePanel(props: CodePanelProps) {
  const { file, code, language, highlight = [], notes = {}, tone } = props
  const styles = codePanel({ tone })
  const lines = toLines(
    refractor.highlight(code.replace(/\n$/, ""), language)
      .children as HastNode[],
  )
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
                  {line.length ? render(line) : " "}
                </span>
                {notes[i + 1] && (
                  <span className={styles.note}>{notes[i + 1]}</span>
                )}
              </div>
            )
          })}
        </code>
      </pre>
    </div>
  )
}
