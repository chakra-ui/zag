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
import { Box, styled } from "styled-system/jsx"
import { Showcase } from "../demos"
import { FRAMEWORKS } from "../lib/framework-utils"
import { CodeSnippetTabs } from "./code-snippet-tabs"
import { CopyButton } from "./copy-button"
import { CssVarTable } from "./css-var-table"
import { DataAttrTable } from "./data-attr-table"
import { KeyboardTable } from "./keyboard-table"
import { ResourceLinkGroup } from "./mdx/resource-link"
import { PropTable } from "./prop-table"
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

const Anchor = styled("a", {
  base: {
    color: "text.primary.bold",
    cursor: "pointer",
    fontWeight: "medium",
    textDecoration: "underline",
    textDecorationColor: "cyan.default",
    textDecorationThickness: "1px",
    textUnderlineOffset: "2px",
    _hover: {
      textDecorationThickness: "2px",
    },
  },
})

const components: Record<string, FC<any>> = {
  LLMsTxtLink(props) {
    return (
      <Anchor target="_blank" rel="noopener" {...props}>
        <Code className="prose">{props.href}</Code>
      </Anchor>
    )
  },
  Showcase,
  SectionIndex,
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
    return <ResourceLinkGroup item={item} />
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
  pre(props) {
    return <styled.pre {...props} className={`prose ${props.className}`} />
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
      <table>
        <thead>
          <tr>
            {headings.map((heading) => (
              <th key={heading}>{heading}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map(([prop, value], idx) => (
            <tr key={idx}>
              <td>
                <Code className="prose">{prop}</Code>
              </td>
              <td>
                <Code fontSize="sm" whiteSpace="pre-wrap">
                  {value}
                </Code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )
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
      <Box
        my="8"
        bg="linear-gradient(90deg, #41B883 -2.23%, #299464 92.64%)"
        css={{
          "& > svg": {
            maxW: "100%",
            h: "auto",
          },
        }}
      >
        <Anatomy accentColor="#2CFF80" />
      </Box>
    )
  },
}

export { components as mdxComponents }
