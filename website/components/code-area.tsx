import { Box } from "@chakra-ui/layout"
import { getSnippetDoc } from "lib/contentlayer-utils"
import { useMDX } from "./mdx-components"

export function CodeArea({ slug }: { slug: string }) {
  const doc = getSnippetDoc(slug)
  const Component = useMDX(doc.body.code)
  return (
    <Box
      height="full"
      sx={{
        "pre[class*=language-]": {
          bg: "inherit",
          margin: "0",
          padding: "40px 24px !important",
          height: "full",
        },
      }}
    >
      {Component}
    </Box>
  )
}
