import { CssVarDocKey, CssVarEntry, getCssVarDoc } from "@zag-js/docs"
import {
  DocTable,
  DocTableHead,
  DocTableKey,
  DocTableRow,
} from "components/ui/doc-table"
import { Fragment } from "react"
import { Box } from "styled-system/jsx"

interface Props {
  name: CssVarDocKey
}

export const CssVarTable = (props: Props) => {
  let data: CssVarEntry

  try {
    data = getCssVarDoc(props.name)
  } catch {
    return null
  }

  return (
    <DocTable>
      {Object.entries(data).map(([part, vars]) => (
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
          {Object.entries(vars)
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
