import { AccessibilityDocKey, getAccessibilityDoc } from "@zag-js/docs"
import { Kbd } from "components/ui/kbd"
import { HStack, Stack } from "styled-system/jsx"

interface Props {
  name: AccessibilityDocKey
}

export const KeyboardTable = (props: Props) => {
  const data = getAccessibilityDoc(props.name)

  return (
    <Stack
      as="ul"
      paddingLeft="0!"
      listStyleType="none"
      listStylePosition="inside"
      divideY="1px"
    >
      {data.keyboard.map(({ keys, description }, index) => (
        <Stack align="flex-start" gap="2" as="li" key={index} py="4">
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
