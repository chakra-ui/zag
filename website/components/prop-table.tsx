import { Box, Stack, StackDivider } from "@chakra-ui/layout"
import { chakra } from "@chakra-ui/system"
import apiJson from "@zag-js/docs"

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
      paddingLeft="0!"
      spacing="5"
      listStyleType="none"
      listStylePosition="inside"
      divider={<StackDivider />}
    >
      {entries.map(([key, item], index) => (
        <Stack align="flex-start" spacing="2" as="li" key={index}>
          <chakra.code
            className="prose"
            layerStyle="inlineCode"
            whiteSpace="pre-wrap"
          >
            {key}
          </chakra.code>
          <chakra.code fontSize="sm" whiteSpace="pre-wrap">
            {item.type}
          </chakra.code>
          <chakra.span display="block">{item.description}</chakra.span>
        </Stack>
      ))}
    </Stack>
  )
}
