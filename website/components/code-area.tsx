import { getSnippetDoc } from "lib/contentlayer-utils"
import { useMemo } from "react"
import { Box } from "styled-system/jsx"
import { useMDX } from "./mdx-components"

interface CodeAreaProps {
  slug: string
}

export function CodeArea(props: CodeAreaProps) {
  const { slug } = props

  const doc = useMemo(() => getSnippetDoc(slug), [slug])
  const Component = useMDX(doc?.body.code ?? "")

  return (
    <Box
      height="full"
      css={{
        "& pre[class*=language-]": {
          bg: "inherit",
          margin: "0",
          padding: "40px 24px !important",
          height: "full",
        },
      }}
    >
      {doc ? Component : "Code not available!"}
    </Box>
  )
}
