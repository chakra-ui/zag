import { Box, type BoxProps } from "styled-system/jsx"

export function CodeHtml(props: BoxProps & { html: string }) {
  const { html, ...rest } = props
  return (
    <Box
      overflowX="auto"
      css={{
        "& pre[class*=language-]": {
          bg: "transparent",
          m: "0",
          p: "5",
          borderWidth: "0",
          borderRadius: "0",
          fontSize: "13px",
          lineHeight: "1.6",
        },
      }}
      dangerouslySetInnerHTML={{ __html: html }}
      {...rest}
    />
  )
}
