import { HStack, Stack, StackDivider } from "@chakra-ui/layout"
import { AccessibilityDocKey, getAccessibilityDoc } from "@zag-js/docs"
import { Kbd } from "./kbd"

interface Props {
  name: AccessibilityDocKey
}

export const KeyboardTable = (props: Props) => {
  const data = getAccessibilityDoc(props.name)

  return (
    <Stack
      as="ul"
      paddingLeft="0!"
      spacing="5"
      listStyleType="none"
      listStylePosition="inside"
      divider={<StackDivider />}
    >
      {data.keyboard.map(({ keys, description }, index) => (
        <Stack align="flex-start" spacing="2" as="li" key={index}>
          <HStack>
            {keys.map((k) => (
              <Kbd key={k}>{k}</Kbd>
            ))}
          </HStack>
          <div dangerouslySetInnerHTML={{ __html: description }} />
        </Stack>
      ))}
    </Stack>
  )
}
