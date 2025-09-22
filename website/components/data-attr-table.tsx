import { Box, HStack, Stack } from "styled-system/jsx"
import { DataAttrDocKey, DataAttrEntry, getDataAttrDoc } from "@zag-js/docs"
import { Kbd } from "components/ui/kbd"

interface Props {
  name: DataAttrDocKey
}

export const DataAttrTable = (props: Props) => {
  let data: DataAttrEntry

  try {
    data = getDataAttrDoc(props.name)
  } catch {
    return null
  }

  return (
    <Stack
      paddingLeft="0!"
      listStyleType="none"
      listStylePosition="inside"
      divideY="1px"
    >
      {Object.entries(data).map(([part, attrs], index) => (
        <Stack key={index} gap="4" py="4">
          <Box fontWeight="semibold">{part}</Box>
          <Stack align="flex-start" gap="4" maxW="lg">
            {Object.entries(attrs)
              .filter(([_key, value]) => value !== "")
              .map(([key, value], index) => (
                <HStack key={index} gap="8" width="full">
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
