import { Box } from "styled-system/jsx"
import { EditPageLink } from "./mdx/edit-page-link"
import { Pagination } from "./pagination"

/** Prev/next cards, then page actions. The credits live in the full-width docs footer. */
export function MdxFooter(props: { editUrl?: string }) {
  return (
    <footer>
      <Pagination
        mt="20"
        pt="10"
        borderTopWidth="1px"
        borderColor="border.subtle"
      />
      {props.editUrl && (
        <Box mt="6">
          <EditPageLink href={props.editUrl} />
        </Box>
      )}
    </footer>
  )
}
