import { Stack, StackDivider } from "@chakra-ui/layout"
import { chakra } from "@chakra-ui/system"
import apiJson from "@zag-js/docs"

type ApiTableProps = {
  name: keyof typeof apiJson
}

export const ApiTable = ({ name }: ApiTableProps) => {
  const { api } = apiJson[name]
  const entries = Object.entries(api)
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
