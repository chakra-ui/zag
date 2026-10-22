import apiJson from "@zag-js/docs"
import { DocTable, DocTableHead, DocTableKey } from "components/ui/doc-table"
import { Box, Stack, styled } from "styled-system/jsx"

interface ApiTableProps {
  type: "api" | "context"
  name: keyof typeof apiJson
}

export const PropTable = (props: ApiTableProps) => {
  const { name, type = "api" } = props

  if (!(name in apiJson)) return <Box>No data available for {name}</Box>

  const entries = Object.entries(apiJson[name][type])

  return (
    <DocTable>
      <DocTableHead>{type === "context" ? "Prop" : "Property"}</DocTableHead>
      <Stack as="ul" gap="0" listStyleType="none" paddingLeft="0!" my="0!">
        {entries.map(([key, item]) => (
          <Stack
            as="li"
            key={key}
            align="flex-start"
            gap="1.5"
            px="4"
            py="4"
            my="0!"
            css={{
              "& + &": { borderTopWidth: "1px", borderColor: "border.subtle" },
            }}
          >
            <DocTableKey>{key}</DocTableKey>
            <styled.code
              fontFamily="mono"
              fontSize="12px"
              color="text.muted"
              whiteSpace="pre-wrap"
              overflowWrap="anywhere"
            >
              {item.type}
            </styled.code>
            <styled.span display="block" color="text.subtle">
              {item.description}
            </styled.span>
          </Stack>
        ))}
      </Stack>
    </DocTable>
  )
}
