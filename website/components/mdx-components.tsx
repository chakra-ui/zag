import { allComponents, allSnippets } from "@/contentlayer"
import { Icon } from "@chakra-ui/icon"
import { Box, HStack, StackProps, Wrap } from "@chakra-ui/layout"
import { chakra } from "@chakra-ui/system"
import { allComponents as Anatomies } from "@zag-js/anatomy-icons"
import { normalizeProps, useMachine } from "@zag-js/react"
import * as tabs from "@zag-js/tabs"
import { type MDX } from "contentlayer/core"
import { useMDXComponent } from "next-contentlayer/hooks"
import Image from "next/image"
import Link from "next/link"
import { type FC } from "react"
import { HiOutlineCode } from "react-icons/hi"
import { ImMagicWand } from "react-icons/im"
import { RiNpmjsFill } from "react-icons/ri"
import { FRAMEWORKS, frameworks } from "../lib/framework-utils"
import { CopyButton } from "./copy-button"
import { DataAttrTable } from "./data-attr-table"
import { useFramework } from "./framework"
import { KeyboardTable } from "./keyboard-table"
import { PropTable } from "./prop-table"
import { Showcase } from "./showcase"

function SnippetItem({ body, id }: { body: MDX; id: string }) {
  const content = useMDX(body.code)
  const textContent = body.raw.split("\n").slice(1, -2).join("\n")
  return (
    <div className="prose" id="snippet" data-framework={id}>
      {content}
      <CopyButton content={textContent} />
    </div>
  )
}

type ResourceLinkProps = {
  href?: string | undefined
  icon: FC
  children: any
}

export function ResourceLink({
  href,
  icon,
  children,
  ...rest
}: ResourceLinkProps & StackProps) {
  return (
    <HStack
      as="a"
      href={href}
      target="_blank"
      borderWidth="1px"
      px="2"
      py="1"
      fontSize="sm"
      spacing="1"
      cursor="pointer"
      {...rest}
    >
      <Icon as={icon} color="green.500" fontSize="lg" />
      <span>{children}</span>
    </HStack>
  )
}

const components: Record<string, FC<any>> = {
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
    return (
      <Wrap mt="6" spacingX="4">
        <ResourceLink icon={RiNpmjsFill} href={comp.npmUrl} data-id="npm">
          {comp.version} (latest)
        </ResourceLink>
        <ResourceLink
          icon={ImMagicWand}
          href={comp.visualizeUrl}
          data-id="logic"
        >
          Visualize Logic
        </ResourceLink>
        <ResourceLink
          icon={HiOutlineCode}
          href={comp.sourceUrl}
          data-id="source"
        >
          View Source
        </ResourceLink>
      </Wrap>
    )
  },
  blockquote(props) {
    return <chakra.blockquote layerStyle="blockquote" {...props} />
  },
  h1(props) {
    return (
      <chakra.h1
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
    return <chakra.h2 textStyle="display.md" mt="12" mb="3" {...props} />
  },
  h3(props) {
    return <chakra.h3 textStyle="display.sm" mt="6" mb="4" {...props} />
  },
  h4(props) {
    return <chakra.h4 textStyle="display.xs" mt="6" mb="2" {...props} />
  },
  pre(props) {
    return <chakra.pre {...props} className={`prose ${props.className}`} />
  },
  li(props) {
    return (
      <chakra.li
        sx={{
          "&::marker": {
            color: "cyan.default",
          },
        }}
        {...props}
      />
    )
  },
  inlineCode(props) {
    return <chakra.code className="prose" layerStyle="inlineCode" {...props} />
  },
  ApiTable(props) {
    return <PropTable type="api" {...props} />
  },
  KeyboardTable,
  DataAttrTable,
  ContextTable(props) {
    return <PropTable type="context" {...props} />
  },
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
                <chakra.code className="prose" layerStyle="inlineCode">
                  {prop}
                </chakra.code>
              </td>
              <td>
                <chakra.code fontSize="sm" whiteSpace="pre-wrap">
                  {value}
                </chakra.code>
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

    const [state, send] = useMachine(
      tabs.machine({
        id: props.id,
        value: userFramework ?? "react",
      }),
    )

    const api = tabs.connect(state, send, normalizeProps)

    return (
      <Box
        width="full"
        maxW="768px"
        borderWidth="1px"
        my="8"
        bg="bg-code-block"
        rounded="6px"
        {...api.getRootProps()}
      >
        <Box {...api.getListProps()}>
          {FRAMEWORKS.map((framework) => (
            <chakra.button
              py="2"
              px="8"
              fontSize="sm"
              fontWeight="medium"
              borderBottom="2px solid transparent"
              bg="bg-code-block"
              _selected={{
                borderColor: "border-primary-subtle",
                color: "text-primary-bold",
              }}
              _focusVisible={{ outline: "2px solid blue" }}
              {...api.getTriggerProps({ value: framework })}
              key={framework}
            >
              <HStack>
                <Icon as={frameworks[framework].icon} />
                <p>{frameworks[framework].label}</p>
              </HStack>
            </chakra.button>
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
        <chakra.a as={Link} href={href} textStyle="link" {...props}>
          {props.children}
        </chakra.a>
      )
    }

    return (
      <chakra.a textStyle="link" target="_blank" rel="noopener" {...props} />
    )
  },
  Anatomy: ({ id }: { id: string }) => {
    if (!(id in Anatomies)) return <Box>No anatomy available for {id}</Box>

    const Anatomy = chakra(Anatomies[id as keyof typeof Anatomies])
    return (
      <Box my="8" bg="linear-gradient(90deg, #41B883 -2.23%, #299464 92.64%)">
        <Anatomy accentColor="#2CFF80" maxW="100%" h="auto" />
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
