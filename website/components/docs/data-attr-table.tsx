import { DataAttrDocKey, DataAttrEntry, getDataAttrDoc } from "@zag-js/docs"
import {
  DocTable,
  DocTableHead,
  DocTableKey,
  DocTableRow,
} from "components/ui/doc-table"
import { Fragment } from "react"
import { Box } from "styled-system/jsx"

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
    <DocTable>
      {Object.entries(data).map(([part, attrs]) => (
        <Fragment key={part}>
          <DocTableHead
            textTransform="none"
            letterSpacing="0.02em"
            fontSize="12px"
            color="text.bold"
            css={{ "* + &": { borderTopWidth: "1px" } }}
          >
            {part}
          </DocTableHead>
          {Object.entries(attrs)
            .filter(([_key, value]) => value !== "")
            .map(([key, value]) => (
              <DocTableRow key={key}>
                <DocTableKey>{key}</DocTableKey>
                <Box color="text.muted">{value}</Box>
              </DocTableRow>
            ))}
        </Fragment>
      ))}
    </DocTable>
  )
}
