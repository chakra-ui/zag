import { docHref, getActiveTab, isCurrentDoc } from "lib/pagination-utils"
import Link, { type LinkProps } from "next/link"
import { usePathname } from "next/navigation"
import { useLayoutEffect, useRef } from "react"
import { tabs } from "sidebar.config"
import { useFramework } from "./framework"
import * as styles from "./sidebar.css"

interface DocLinkProps {
  href: LinkProps["href"]
  current: boolean
  scrollIntoView: boolean
  children: React.ReactNode
}

function DocLink(props: DocLinkProps) {
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

  return (
    <li>
      <Link
        ref={linkRef}
        href={href.toString()}
        aria-current={current ? "page" : undefined}
        className={styles.link}
      >
        {children}
      </Link>
    </li>
  )
}

/**
 * Only the active section's pages. The mobile menu passes `tabId` to show another
 * section, and keeps its own scroll so its switcher stays in view.
 */
export function Sidebar(props: { tabId?: string }) {
  const { framework } = useFramework()
  const pathname = usePathname()
  const tab =
    tabs.find((tab) => tab.id === props.tabId) ?? getActiveTab(pathname)
  const standalone = !props.tabId

  return (
    <div className={styles.root}>
      <nav aria-label={`${tab.label} navigation`}>
        <ul className={styles.groups}>
          {tab.groups.map((group) => (
            <li key={group.label} className={styles.group}>
              <h5 className={styles.heading}>{group.label}</h5>
              <ul className={styles.list}>
                {group.items.map((item) => (
                  <DocLink
                    key={`${item.section}/${item.id}`}
                    href={docHref(item, framework)}
                    current={isCurrentDoc(item, pathname)}
                    scrollIntoView={standalone}
                  >
                    {item.label}
                    {item.new && (
                      <span className={styles.newDot} title="New">
                        <span className={styles.srOnly}>, new</span>
                      </span>
                    )}
                    {item.beta && <span className={styles.badge}>Beta</span>}
                  </DocLink>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
