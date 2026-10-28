import { Link } from "components/ui/link"
import { docHref, getActiveTab, isCurrentDoc } from "lib/pagination-utils"
import { type LinkProps } from "next/link"
import { usePathname } from "next/navigation"
import { useLayoutEffect, useRef } from "react"
import { tabs } from "sidebar.config"
import { docsNav } from "styled-system/recipes"
import { useFramework } from "./framework"

interface DocLinkProps {
  href: LinkProps["href"]
  current: boolean
  scrollIntoView: boolean
  children: React.ReactNode
}

const DocLink = (props: DocLinkProps) => {
  const asPath = usePathname()
  const { href, current, scrollIntoView, children } = props
  const linkRef = useRef<HTMLAnchorElement>(null)

  useLayoutEffect(() => {
    const link = linkRef.current
    if (!scrollIntoView || !current || !link) return
    // scroll only the sidebar column; scrollIntoView would also move the page
    const container = link.closest<HTMLElement>("[data-sidebar-scroll]")
    if (!container) return
    const linkTop = link.getBoundingClientRect().top
    const containerTop = container.getBoundingClientRect().top
    container.scrollTop += linkTop - containerTop - container.clientHeight / 2
  }, [scrollIntoView, current, asPath])

  const styles = docsNav()
  return (
    <li>
      <Link
        ref={linkRef}
        href={href.toString()}
        aria-current={current ? "page" : undefined}
        className={styles.link}
      >
        {children}
        {current && <span className={styles.dot} />}
      </Link>
    </li>
  )
}

/**
 * Only the active tab's groups. The mobile menu passes `tabId` to show another
 * tab, and keeps its own scroll so the tab switcher stays in view.
 */
export function Sidebar(props: { tabId?: string }) {
  const { framework } = useFramework()
  const pathname = usePathname()
  const tab =
    tabs.find((tab) => tab.id === props.tabId) ?? getActiveTab(pathname)

  const styles = docsNav()

  return (
    <nav aria-label={`${tab.label} navigation`}>
      <ul className={styles.root}>
        {tab.groups.map((group) => (
          <li key={group.label} className={styles.group}>
            <h5 className={styles.heading}>{group.label}</h5>
            <ul className={styles.list}>
              {group.items.map((item) => (
                <DocLink
                  key={`${item.section}/${item.id}`}
                  href={docHref(item, framework)}
                  current={isCurrentDoc(item, pathname)}
                  scrollIntoView={!props.tabId}
                >
                  {item.label}
                  {item.new && <span className={styles.badge}>New</span>}
                  {item.beta && <span className={styles.badge}>Beta</span>}
                </DocLink>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  )
}
