"use client"

import { CopyPageWidget } from "components/docs/copy-page-widget"
import { DocsSubnav } from "components/docs/docs-subnav"
import { MdxFooter } from "components/docs/mdx-footer"
import { Sidebar } from "components/docs/sidebar"
import { SkipNavContent, SkipNavLink } from "components/docs/skip-nav"
import { TableOfContents } from "components/docs/toc"
import { FooterCredits } from "components/footer"
import { TopNav } from "components/nav/top-nav"
import { getActiveTab, isCurrentDoc } from "lib/pagination-utils"
import { usePathname } from "next/navigation"
import * as styles from "./docs-layout.css"

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
  const tab = getActiveTab(pathname)
  const group = tab.groups.find((g) =>
    g.items.some((item) => isCurrentDoc(item, pathname)),
  )

  return (
    <>
      <SkipNavLink>Skip to main content</SkipNavLink>
      <TopNav wide>
        <DocsSubnav />
      </TopNav>
      <SkipNavContent />
      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <div data-sidebar-scroll="" className={styles.scroll}>
            <Sidebar />
          </div>
        </aside>

        <main className={`mdx-content ${styles.main}`}>
          {doc?.title && (
            <div className={styles.header}>
              <p className={styles.crumb}>
                <span>{tab.label}</span>
                {group && (
                  <>
                    <span aria-hidden>/</span>
                    <span aria-current="page">{group.label}</span>
                  </>
                )}
              </p>
              <div className={styles.titleRow}>
                <h1 className={styles.title}>{doc.title}</h1>
                {doc?.body?.raw && (
                  <CopyPageWidget slug={pathname} title={doc.title} />
                )}
              </div>
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
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <FooterCredits />
        </div>
      </footer>
    </>
  )
}
