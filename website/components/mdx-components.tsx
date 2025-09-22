import { allComponents, allSnippets } from "@/contentlayer"
import { allComponents as Anatomies } from "@zag-js/anatomy-icons"
import { normalizeProps, useMachine } from "@zag-js/react"
import * as tabs from "@zag-js/tabs"
import { Blockquote } from "components/ui/blockquote"
import { Code } from "components/ui/code"
import { Icon } from "components/ui/icon"
import { type MDX } from "contentlayer/core"
import { useMDXComponent } from "next-contentlayer/hooks"
import Image from "next/image"
import Link from "next/link"
import { type FC } from "react"
import { Box, HStack, styled } from "styled-system/jsx"
import { Showcase } from "../demos"
import { FRAMEWORKS, frameworks } from "../lib/framework-utils"
import { CopyButton } from "./copy-button"
import { CssVarTable } from "./css-var-table"
import { DataAttrTable } from "./data-attr-table"
import { useFramework } from "./framework"
import { KeyboardTable } from "./keyboard-table"
import { ResourceLinkGroup } from "./mdx/resource-link"
import { PropTable } from "./prop-table"

const SnippetItem = ({ body, id }: { body: MDX; id: string }) => {
  const content = useMDX(body.code)
  const textContent = body.raw.split("\n").slice(1, -2).join("\n")
  return (
    <div className="prose" id="snippet" data-framework={id}>
      {content}
      <CopyButton content={textContent} />
    </div>
  )
}

const Anchor = styled("a", {
  base: {
    color: "green.500",
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
    const comp = allComponents.find((c) => c.package === props.pkg)
    if (!comp) return null
    return <ResourceLinkGroup item={comp} />
  },
  blockquote(props) {
    return <Blockquote {...props} />
  },
  h1(props) {
    return (
      <styled.h1
        id="skip-nav"
        textStyle="display.lg"
        mb="5"
        maxW="85ch"
        tabIndex={-1}
        {...props}
      />
    )
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
            color: "cyan.default",
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
    const { framework: userFramework } = useFramework()

    const snippets = allSnippets.filter((p) => {
      const [_, __, ...rest] = p.params
      const str = rest.join("/") + ".mdx"
      return str === props.id
    })

    const service = useMachine(tabs.machine, {
      id: props.id,
      defaultValue: userFramework ?? "react",
    })

    const api = tabs.connect(service, normalizeProps)

    return (
      <Box
        width="full"
        maxW="768px"
        borderWidth="1px"
        my="8"
        bg="bg-code.block"
        rounded="6px"
        {...api.getRootProps()}
      >
        <Box {...api.getListProps()}>
          {FRAMEWORKS.map((framework) => (
            <styled.button
              py="2"
              px="8"
              fontSize="sm"
              fontWeight="medium"
              borderBottom="2px solid transparent"
              bg="bg.code.block"
              _selected={{
                borderColor: "border.primary.subtle",
                color: "text.primary.bold",
              }}
              _focusVisible={{ outline: "2px solid blue" }}
              {...api.getTriggerProps({ value: framework })}
              key={framework}
            >
              <HStack>
                <Icon as={frameworks[framework].icon} />
                <p>{frameworks[framework].label}</p>
              </HStack>
            </styled.button>
          ))}
        </Box>
        {FRAMEWORKS.map((framework) => {
          const snippet = snippets.find((p) => p.framework === framework)
          return (
            <Box
              {...api.getContentProps({ value: framework })}
              position="relative"
              key={framework}
              mt="-6"
              _focusVisible={{ outline: "2px solid blue" }}
            >
              {snippet ? (
                <SnippetItem id={framework} body={snippet.body} />
              ) : (
                <Box mt="6" padding="4" fontSize="sm" opacity="0.5">
                  Snippet not found :(
                </Box>
              )}
            </Box>
          )
        })}
      </Box>
    )
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

export function useMDX(code: string | undefined) {
  const defaultCode = `
return { default: () => React.createElement('div', null, '') }
`
  const pageCode = code && code?.length ? code : defaultCode
  const MDXComponent = useMDXComponent(pageCode)
  return <MDXComponent components={components as any} />
}
