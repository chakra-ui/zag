import { getSnippetBody } from "lib/source"
import { Box } from "styled-system/jsx"
import { mdxComponents } from "./mdx-components"

interface CodeAreaProps {
  slug: string
}

export function CodeArea(props: CodeAreaProps) {
  const Body = getSnippetBody(props.slug)

  return (
    <Box
      height="full"
      css={{
        "& pre[class*=language-]": {
          bg: "inherit",
          margin: "0",
          padding: "40px 24px !important",
          height: "full",
          borderWidth: "0",
        },
      }}
    >
      {Body ? <Body components={mdxComponents} /> : "Code not available!"}
    </Box>
  )
}
