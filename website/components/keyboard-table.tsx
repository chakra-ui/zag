import { HStack, Stack, StackDivider } from "@chakra-ui/layout"
import { chakra } from "@chakra-ui/system"
import { Kbd } from "./kbd"

interface KeyboardData {
  keys: string[]
  description: React.ReactNode
}

export const KeyboardTable = (props: { data: KeyboardData[] }) => {
  const { data } = props

  return (
    <Stack
      as="ul"
      paddingLeft="0!"
      spacing="5"
      listStyleType="none"
      listStylePosition="inside"
      divider={<StackDivider />}
    >
      {data.map(({ keys, description }, index) => (
        <Stack align="flex-start" spacing="2" as="li" key={index}>
          <HStack>
            {keys.map((k) => (
              <Kbd key={k}>{k}</Kbd>
            ))}
          </HStack>
          <chakra.span display="block">{description}</chakra.span>
        </Stack>
      ))}
    </Stack>
  )
}
