import { styled, Box } from "styled-system/jsx"
import siteConfig from "site.config"
import { Pagination } from "./pagination"

export function MdxFooter() {
  return (
    <styled.footer mt="12">
      <Pagination />
      <Box
        pt="10"
        borderTopWidth="1px"
        display={{ sm: "flex" }}
        justifyContent="space-between"
      >
        <Box fontSize="sm" mb={{ base: "6", sm: "0" }}>
          A project by{" "}
          <a
            href="https://chakra-ui.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Chakra Systems
          </a>
        </Box>
      </Box>

      <Box
        fontSize="sm"
        mt="4"
        mb="28"
        opacity={0.5}
        dangerouslySetInnerHTML={{ __html: siteConfig.copyright }}
      />
    </styled.footer>
  )
}
