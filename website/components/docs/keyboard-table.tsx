import { AccessibilityDocKey, getAccessibilityDoc } from "@zag-js/docs"
import { DocTable, DocTableHead, DocTableRow } from "components/ui/doc-table"
import { Kbd } from "components/ui/kbd"
import { Box, HStack } from "styled-system/jsx"

interface Props {
  name: AccessibilityDocKey
}

const columns = { base: "1fr", sm: "minmax(0, 2fr) minmax(0, 3fr)" }

export const KeyboardTable = (props: Props) => {
  const data = getAccessibilityDoc(props.name)

  return (
    <DocTable>
      <DocTableHead gridTemplateColumns={columns} hideBelow="sm">
        <span>Key</span>
        <span>Description</span>
      </DocTableHead>
      {data.keyboard.map(({ keys, description }, index) => (
        <DocTableRow key={index} alignItems="center">
          <HStack gap="1.5" flexWrap="wrap">
            {keys.map((k) => (
              <Kbd key={k}>{k}</Kbd>
            ))}
          </HStack>
          <Box
            color="text.muted"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </DocTableRow>
      ))}
    </DocTable>
  )
}
