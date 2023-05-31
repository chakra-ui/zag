import { Box, Spacer, panda } from "styled-system/jsx"
import { FrameworkSelect } from "components/framework-select"
import { MdxFooter } from "components/mdx-footer"
import { Search } from "components/search-dialog"
import { Sidebar } from "components/sidebar"
import { SkipNavLink } from "components/skip-nav"
import { TableOfContents } from "components/toc"
import { TopNavigation } from "components/top-navigation"
import React from "react"
import { hstack } from "styled-system/patterns"
import { icon } from "styled-system/recipes"

type DocsLayoutProps = {
  children: React.ReactNode
  doc: any
  toc?: {
    title?: string
    data?: any[]
    getSlug?: (slug: string) => string
  }
}

export default function DocsLayout({ children, doc, toc }: DocsLayoutProps) {
  const tableOfContent = toc?.data ?? doc.frontmatter.toc
  const hideToc = tableOfContent.length < 2

  return (
    <Box>
      <SkipNavLink>Skip to main content</SkipNavLink>
      <TopNavigation />
      <panda.div pt="10">
        <Box maxW="8xl" mx="auto" px={{ sm: "6", base: "4", md: "8" }}>
          <Box
            display={{ base: "none", lg: "block" }}
            position="fixed"
            zIndex={20}
            bottom="0"
            top="4rem"
            left="max(0px, calc(50% - 45rem))"
            right="auto"
            width="19.5rem"
            pb="10"
            px="8"
            overflowY="auto"
            overscrollBehavior="contain"
          >
            <Box position="relative">
              <Box position="sticky" top="0" bg="bg-subtle" pb="8">
                <Spacer height="10" bg="transparent" />
                <Search />
                <Spacer mt="px" height="5" bg="transparent" />
                <FrameworkSelect />
              </Box>
              <Sidebar />
            </Box>
          </Box>

          <panda.main
            className="mdx-content"
            pl={{ lg: "19.5rem" }}
            pt="4"
            pr={{ xl: "16" }}
          >
            <Box mr={{ xl: "15.5rem" }}>
              {children}
              <panda.a
                className={hstack({ display: "inline-flex" })}
                href={doc.editUrl}
                fontSize="sm"
                mt="14"
              >
                <span
                  className={icon({ name: "heroicons-outline:pencil-alt" })}
                />
                <p>Edit this page on GitHub</p>
              </panda.a>
              <MdxFooter />
            </Box>
          </panda.main>

          <Box
            py="10"
            px="8"
            overflowY="auto"
            position="fixed"
            top="3.8rem"
            bottom="0"
            right="max(0px,calc(50% - 45rem))"
            display={{ base: "none", xl: "block" }}
            width="19.5rem"
            visibility={hideToc ? "hidden" : undefined}
          >
            <TableOfContents
              title={toc?.title}
              data={tableOfContent}
              getSlug={toc?.getSlug}
            />
          </Box>
        </Box>
      </panda.div>
    </Box>
  )
}
