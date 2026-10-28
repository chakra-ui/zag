import { Fragment, type ReactNode } from "react"
import { refractor } from "refractor/core"
import bash from "refractor/bash"
import css from "refractor/css"
import tsx from "refractor/tsx"
import { Box, styled } from "styled-system/jsx"

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

const tones = {
  accent: "accent",
  panda: "#F6E458",
  tailwind: "#38BDF8",
} as const

export interface CodePanelProps {
  file?: string
  code: string
  language: "tsx" | "css" | "bash"
  /** 1-based line numbers */
  highlight?: number[]
  highlightTone?: keyof typeof tones
  /** text shown on the right of the first highlighted line */
  note?: string
}

export function CodePanel(props: CodePanelProps) {
  const {
    file,
    code,
    language,
    highlight = [],
    highlightTone = "accent",
    note,
  } = props
  const tone = tones[highlightTone]
  // ponytail: highlights line by line, so multi-line block comments or template strings
  // lose their colour past the first line. Fine for the short snippets on the site.
  const lines = code.replace(/\n$/, "").split("\n")
  return (
    <Box display="flex" flexDirection="column" minW="0">
      {file && (
        <styled.p
          px="5"
          py="3"
          fontFamily="mono"
          fontSize="12px"
          color="fg"
          borderBottomWidth="1px"
          borderColor="border"
        >
          {file}
        </styled.p>
      )}
      <styled.pre
        className={`language-${language}`}
        m="0"
        py="4"
        overflowX="auto"
        fontFamily="mono"
        fontSize="13px"
        lineHeight="1.9"
        bg="transparent"
      >
        <code className={`language-${language}`}>
          {lines.map((line, i) => {
            const active = highlight.includes(i + 1)
            return (
              <Box
                key={i}
                display="flex"
                alignItems="center"
                gap="4"
                px="5"
                minH="1.9em"
                data-active={active || undefined}
                style={
                  active
                    ? {
                        background: `color-mix(in srgb, ${tone === "accent" ? "var(--colors-accent)" : tone} 8%, transparent)`,
                        boxShadow: `inset 2px 0 0 ${tone === "accent" ? "var(--colors-accent)" : tone}`,
                      }
                    : undefined
                }
              >
                <styled.span whiteSpace="pre" flex="1">
                  {line === ""
                    ? " "
                    : render(
                        refractor.highlight(line, language)
                          .children as HastNode[],
                      )}
                </styled.span>
                {active && note && i + 1 === highlight[0] && (
                  <styled.span
                    fontSize="11px"
                    color="accent"
                    whiteSpace="nowrap"
                  >
                    {note}
                  </styled.span>
                )}
              </Box>
            )
          })}
        </code>
      </styled.pre>
    </Box>
  )
}
