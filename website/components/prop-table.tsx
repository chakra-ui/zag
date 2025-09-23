import { styled, Box, Stack } from "styled-system/jsx"
import apiJson from "@zag-js/docs"
import { Code } from "components/ui/code"

interface ApiTableProps {
  type: "api" | "context"
  name: keyof typeof apiJson
}

export const PropTable = (props: ApiTableProps) => {
  const { name, type = "api" } = props

  if (!(name in apiJson)) return <Box>No data available for {name}</Box>

  const data = apiJson[name][type]

  const entries = Object.entries(data)

  return (
    <Stack
      as="ul"
      gap="0"
      paddingLeft="0!"
      listStyleType="none"
      divideY="1px"
      listStylePosition="inside"
    >
      {entries.map(([key, item], index) => (
        <Stack align="flex-start" gap="2" as="li" key={index} py="6">
          <Code className="prose" whiteSpace="pre-wrap">
            {key}
          </Code>
          <styled.code fontSize="sm" whiteSpace="pre-wrap">
            {item.type}
          </styled.code>
          <styled.span display="block">{item.description}</styled.span>
        </Stack>
      ))}
    </Stack>
  )
}
