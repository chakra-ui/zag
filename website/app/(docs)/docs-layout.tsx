"use client"

import { CopyPageWidget } from "components/docs/copy-page-widget"
import { DocsTabBar } from "components/docs/docs-tab-bar"
import { MdxFooter } from "components/docs/mdx-footer"
import { FooterCredits } from "components/footer"
import { Sidebar } from "components/docs/sidebar"
import { SkipNavContent, SkipNavLink } from "components/docs/skip-nav"
import { TableOfContents } from "components/docs/toc"
import { TopNav } from "components/nav/top-nav"
import { usePathname } from "next/navigation"
import { css } from "styled-system/css"
import { Box, Flex, styled } from "styled-system/jsx"

const scrollbarStyles = css({
  // Chrome 121+ and Firefox
  scrollbarWidth: "thin",
  scrollbarColor: "token(colors.border.bold) transparent",
  // Safari
  "&::-webkit-scrollbar": {
    width: "10px",
  },
  "&::-webkit-scrollbar-track": {
    background: "transparent",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "border.bold",
    borderRadius: "full",
    // Inset the thumb so it floats like a pill
    border: "3px solid transparent",
    backgroundClip: "padding-box",
  },
})

type DocsLayoutProps = {
  children: React.ReactNode
  doc: any
  toc?: {
    title?: string
    data?: any[]
    getSlug?: (slug: string) => string
  }
}

export default function DocsLayout(props: DocsLayoutProps) {
  const { children, doc, toc } = props
  const tableOfContent = toc?.data ?? doc.frontmatter?.toc ?? []
  const hideToc = tableOfContent.length < 2
  const pathname = usePathname()

  return (
    <Box>
      <SkipNavLink>Skip to main content</SkipNavLink>
      <Box position="sticky" top="0" zIndex="50">
        <TopNav />
        <DocsTabBar />
      </Box>
      <SkipNavContent />
      {/* Same columns as the Panda docs: a sticky sidebar, the article centered
          at 4xl, and the TOC column always reserved so the article sits in the
          same place with or without one. The container matches the top nav, so
          the logo doesn't move between the docs and the other pages. */}
      <Flex position="relative" maxW="8xl" mx="auto" px={{ md: "8" }}>
        <Box
          as="aside"
          hideBelow="lg"
          flexShrink="0"
          w="240px"
          position="sticky"
          top="calc(6.5rem + 2px)"
          h="calc(100dvh - 6.5rem - 2px)"
        >
          <Box
            data-sidebar-scroll=""
            h="full"
            overflowY="auto"
            overscrollBehavior="contain"
            pt="10"
            pb="10"
            pe="6"
            className={scrollbarStyles}
          >
            <Sidebar />
          </Box>
        </Box>

        <Box
          as="main"
          className="mdx-content"
          flex="1"
          minW="0"
          maxW="4xl"
          mx="auto"
          px={{ base: "4", sm: "6" }}
          pt="10"
          pb="10"
        >
          {doc?.title && (
            <Flex alignItems="center" gap="4" mb="6">
              <styled.h1 textStyle="display.lg" maxW="85ch" flex="1">
                {doc.title}
              </styled.h1>
              {doc?.body?.raw && (
                <CopyPageWidget slug={pathname} title={doc.title} />
              )}
            </Flex>
          )}
          {children}
          <MdxFooter editUrl={doc?.editUrl} />
        </Box>

        <Box
          hideBelow="xl"
          flexShrink="0"
          w="72"
          position="sticky"
          top="calc(6.5rem + 2px)"
          h="calc(100dvh - 6.5rem - 2px)"
        >
          <Box
            h="full"
            overflowY="auto"
            overscrollBehavior="contain"
            pt="10"
            pb="10"
            ps="6"
            className={scrollbarStyles}
          >
            {!hideToc && (
              <TableOfContents
                title={toc?.title}
                data={tableOfContent}
                getSlug={toc?.getSlug}
              />
            )}
          </Box>
        </Box>
      </Flex>
      <Box as="footer" borderTopWidth="1px" borderColor="border.subtle" py="6">
        <Box maxW="8xl" mx="auto" px={{ base: "4", sm: "6", md: "8" }}>
          <FooterCredits />
        </Box>
      </Box>
    </Box>
  )
}
