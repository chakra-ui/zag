import { allComponents as Anatomies } from "@zag-js/anatomy-icons"
import { Blockquote } from "components/ui/blockquote"
import { Code } from "components/ui/code"
import {
  components as allComponents,
  getSnippetBody,
  snippets as allSnippets,
  utilities as allUtilities,
  type Snippet,
} from "lib/source"
import Image from "next/image"
import Link from "next/link"
import { type FC } from "react"
import { cx } from "styled-system/css"
import { Box, styled } from "styled-system/jsx"
import { token } from "styled-system/tokens"
import { Showcase } from "../../demos"
import { FRAMEWORKS } from "../../lib/framework-utils"
import { CodeSnippetTabs } from "./code-snippet-tabs"
import { CopyButton } from "./copy-button"
import { CssVarTable } from "./css-var-table"
import { DataAttrTable } from "./data-attr-table"
import { KeyboardTable } from "./keyboard-table"
import { ResourceLinkGroup } from "./mdx/resource-link"
import { GuideMeta, Steps } from "./mdx/steps"
import { GuideCards } from "./guide-cards"
import { Explorer } from "./explorer"
import { Example } from "./example"
import { explorerDemos } from "../../demos/explorer"
import { LuFileCode } from "react-icons/lu"
import * as codeBlock from "./code-block.css"
import { PropTable } from "./prop-table"
import * as table from "./prop-table.css"
import * as styles from "./mdx.css"
import { SectionIndex } from "./section-index"

const SnippetItem = ({ snippet }: { snippet: Snippet }) => {
  const Body = getSnippetBody(snippet.key)
  const textContent = snippet.body.raw.split("\n").slice(1, -1).join("\n")
  return (
    <div className="prose" id="snippet" data-framework={snippet.framework}>
      {Body ? <Body components={components} /> : null}
      <CopyButton content={textContent} />
    </div>
  )
}

function Anchor({ as: Comp = "a", className, ...props }: any) {
  return <Comp {...props} className={cx(styles.link, className)} />
}

const components: Record<string, FC<any>> = {
  LLMsTxtLink(props) {
    return (
      <Anchor target="_blank" rel="noopener" {...props}>
        <Code className="prose">{props.href}</Code>
      </Anchor>
    )
  },
  Showcase,
  Example,
  SectionIndex,
  Steps,
  GuideMeta,
  GuideCards,
  Admonition(props) {
    return <div {...props} />
  },
  Image(props) {
    return (
      <Box rounded="md" overflow="hidden" mt="6" display="inline-block">
        <Image alt="" {...props} />
      </Box>
    )
  },
  Resources(props) {
    const item =
      allComponents.find((c) => c.package === props.pkg) ??
      allUtilities.find((u) => u.package === props.pkg)
    if (!item) return null
    return <ResourceLinkGroup pkg={props.pkg} item={item} />
  },
  blockquote(props) {
    return <Blockquote {...props} />
  },
  h1(props) {
    return <styled.h1 textStyle="display.lg" mb="5" maxW="85ch" {...props} />
  },
  h2(props) {
    return <styled.h2 textStyle="display.md" mt="12" mb="3" {...props} />
  },
  h3(props) {
    return <styled.h3 textStyle="display.sm" mt="6" mb="4" {...props} />
  },
  h4(props) {
    return <styled.h4 textStyle="display.xs" mt="6" mb="2" {...props} />
  },
  pre({ "data-title": title, ...props }) {
    const pre = (
      <styled.pre
        tabIndex={0}
        {...props}
        className={`prose ${props.className}`}
      />
    )
    if (!title) return pre
    return (
      <figure className={codeBlock.frame}>
        <figcaption className={codeBlock.header}>
          <LuFileCode aria-hidden />
          {title}
        </figcaption>
        {pre}
      </figure>
    )
  },
  li(props) {
    return (
      <styled.li
        css={{
          "&::marker": {
            color: "text.muted",
          },
        }}
        {...props}
      />
    )
  },
  inlineCode(props) {
    return <Code className="prose" {...props} />
  },
  ApiTable(props) {
    return <PropTable type="api" {...props} />
  },
  KeyboardTable,
  DataAttrTable,
  ContextTable(props) {
    return <PropTable type="context" {...props} />
  },
  CssVarTable,
  PropValueTable: (props: {
    items: { headings: string[]; data: Array<[string, string]> }
  }) => {
    const { data, headings } = props.items
    return (
      <div className={table.root}>
        <table className={table.table}>
          <thead>
            <tr>
              {headings.map((heading) => (
                <th key={heading} className={table.th}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(([prop, value], idx) => (
              <tr key={idx}>
                <td className={table.td} width="1%">
                  <code className={table.key}>{prop}</code>
                </td>
                <td className={table.td}>
                  <code className={table.type}>{value}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  },
  table(props) {
    return (
      <div className={table.root}>
        <table {...props} className={table.table} />
      </div>
    )
  },
  th(props) {
    return <th {...props} className={table.th} />
  },
  td(props) {
    return <td {...props} className={table.td} />
  },
  code(props) {
    if (typeof props.children === "string") {
      return <components.inlineCode {...props} />
    }
    return <div className="prose">{props.children}</div>
  },
  CodeSnippet(props) {
    const panels = Object.fromEntries(
      FRAMEWORKS.map((framework) => {
        const snippet = allSnippets.find(
          (p) => p.id === props.id && p.framework === framework,
        )
        return [
          framework,
          snippet ? <SnippetItem key={framework} snippet={snippet} /> : null,
        ]
      }),
    )
    return <CodeSnippetTabs id={props.id} panels={panels} />
  },
  a(props) {
    const href = props.href
    const isInternalLink =
      href && (href.startsWith("/") || href.startsWith("#"))

    if (isInternalLink) {
      return (
        <Anchor as={Link} href={href} {...props}>
          {props.children}
        </Anchor>
      )
    }

    return <Anchor target="_blank" rel="noopener" {...props} />
  },
  Anatomy: ({ id }: { id: string }) => {
    if (!(id in Anatomies)) return <Box>No anatomy available for {id}</Box>
    const Anatomy = Anatomies[id as keyof typeof Anatomies]
    return (
      <>
        <Box
          my="8"
          bg={{ base: "gray.900", _dark: "gray.950" }}
          borderWidth="1px"
          borderColor="border"
          rounded="md"
          overflow="hidden"
          css={{
            "& > svg": {
              maxW: "100%",
              h: "auto",
            },
          }}
        >
          <Anatomy accentColor={token("colors.gray.400")} />
        </Box>
        {id in explorerDemos && <Explorer id={id} />}
      </>
    )
  },
}

export { components as mdxComponents }
