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
import { getActiveTab, isCurrentDoc } from "lib/pagination-utils"
import { Box, Flex } from "styled-system/jsx"
import { docsShell } from "styled-system/recipes"

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
  const styles = docsShell()
  const tab = getActiveTab(pathname)
  const group = tab.groups.find((g) =>
    g.items.some((item) => isCurrentDoc(item, pathname)),
  )
  const crumb = group ? `${tab.label} / ${group.label}` : tab.label

  return (
    <Box>
      <SkipNavLink>Skip to main content</SkipNavLink>
      <Box position="sticky" top="0" zIndex="50">
        <TopNav />
        <DocsTabBar />
      </Box>
      <SkipNavContent />
      <div className={styles.root}>
        <aside className={styles.sidebar}>
          <div data-sidebar-scroll="" className={styles.scroll}>
            <Sidebar />
          </div>
        </aside>

        <main className={`mdx-content ${styles.main}`}>
          {doc?.title && (
            <div className={styles.header}>
              {crumb && <p className={styles.crumb}>{crumb}</p>}
              <Flex alignItems="center" flexWrap="wrap" gap="4">
                <h1 className={styles.title}>{doc.title}</h1>
                {doc?.body?.raw && (
                  <CopyPageWidget slug={pathname} title={doc.title} />
                )}
              </Flex>
            </div>
          )}
          {children}
          <MdxFooter editUrl={doc?.editUrl} />
        </main>

        <div className={styles.toc}>
          <div className={styles.scroll}>
            {!hideToc && (
              <TableOfContents
                title={toc?.title}
                data={tableOfContent}
                getSlug={toc?.getSlug}
              />
            )}
          </div>
        </div>
      </div>
      <Box as="footer" borderTopWidth="1px" borderColor="border.subtle" py="6">
        <Box maxW="8xl" mx="auto" px={{ base: "4", sm: "6", md: "8" }}>
          <FooterCredits />
        </Box>
      </Box>
    </Box>
  )
}
