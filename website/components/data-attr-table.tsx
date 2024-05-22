import { Box, HStack, Stack, StackDivider } from "@chakra-ui/layout"
import { DataAttrDocKey, getDataAttrDoc } from "@zag-js/docs"
import { Kbd } from "./kbd"

interface Props {
  name: DataAttrDocKey
}

export const DataAttrTable = (props: Props) => {
  const data = getDataAttrDoc(props.name)

  return (
    <Stack
      paddingLeft="0!"
      spacing="8"
      listStyleType="none"
      listStylePosition="inside"
      divider={<StackDivider />}
    >
      {Object.entries(data).map(([part, attrs], index) => (
        <Stack key={index} spacing="4">
          <Box fontWeight="semibold">{part}</Box>
          <Stack align="flex-start" spacing="4" maxW="lg">
            {Object.entries(attrs)
              .filter(([_key, value]) => value !== "")
              .map(([key, value], index) => (
                <HStack key={index} spacing="8" width="full">
                  <Box minW="160px">
                    <Kbd>{key}</Kbd>
                  </Box>
                  <span>{value}</span>
                </HStack>
              ))}
          </Stack>
        </Stack>
      ))}
    </Stack>
  )
}
