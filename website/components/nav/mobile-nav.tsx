import * as dialog from "@zag-js/dialog"
import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import * as tabs from "@zag-js/tabs"
import { GithubIcon, HeartIcon } from "components/icons"
import { getActiveTab } from "lib/pagination-utils"
import { useRouteChange } from "lib/use-route-change"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  type CSSProperties,
  useEffect,
  useRef,
  useSyncExternalStore,
} from "react"
import { HiMenu, HiX } from "react-icons/hi"
import { tabs as docsTabs } from "sidebar.config"
import siteConfig from "site.config"
import { cx } from "styled-system/css"
import { FrameworkSelect } from "../docs/framework-select"
import { Presence } from "../docs/presence"
import { Sidebar } from "../docs/sidebar"
import { LogoWithLink } from "../logo"
import { navCluster, navControl } from "./control"
import * as styles from "./mobile-nav.css"
import { navLinks } from "./nav-links"
import { VersionSelect } from "./version-select"

const desktopQuery = "(min-width: 1024px)"

function subscribeDesktop(onChange: () => void) {
  const mql = window.matchMedia(desktopQuery)
  mql.addEventListener("change", onChange)
  return () => mql.removeEventListener("change", onChange)
}

const projectLinks = [
  { label: "GitHub", href: siteConfig.repo.url, Icon: GithubIcon },
  { label: "Sponsor", href: siteConfig.openCollective.url, Icon: HeartIcon },
]

export function MobileNav(props: { className?: string }) {
  const initialRef = useRef<HTMLButtonElement | null>(null)
  const service = useMachine(dialog.machine, {
    id: "m1",
    "aria-label": "Site menu",
    initialFocusEl: () => initialRef.current,
  })
  const api = dialog.connect(service, normalizeProps)
  const pathname = usePathname()

  const desktop = useSyncExternalStore(
    subscribeDesktop,
    () => window.matchMedia(desktopQuery).matches,
    () => false,
  )

  useEffect(() => {
    if (desktop) api.setOpen(false)
  }, [desktop])

  useRouteChange(() => {
    api.setOpen(false)
  })

  return (
    <>
      <button
        type="button"
        className={cx(props.className, styles.trigger)}
        aria-label="Open menu"
        {...api.getTriggerProps()}
      >
        <HiMenu aria-hidden />
      </button>

      <Portal>
        <div {...api.getPositionerProps()}>
          <Presence
            present={api.open}
            className={styles.sheet}
            {...api.getContentProps()}
          >
            <div className={styles.bar}>
              <div className={styles.brand}>
                <LogoWithLink />
                <VersionSelect />
              </div>
              <div className={navCluster}>
                <button
                  ref={initialRef}
                  type="button"
                  className={navControl}
                  {...api.getCloseTriggerProps()}
                  aria-label="Close menu"
                >
                  <HiX aria-hidden className={styles.closeIcon} />
                </button>
              </div>
            </div>

            <div className={styles.body}>
              <nav aria-label="Main" className={styles.primaryNav}>
                {navLinks.map((link, index) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cx(styles.primaryLink, styles.reveal)}
                    style={{ "--index": index } as CSSProperties}
                    aria-current={link.isActive(pathname) ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div
                className={cx(styles.rest, styles.reveal)}
                style={{ "--index": navLinks.length } as CSSProperties}
              >
                <div className={styles.divider} />
                <MobileDocs />
                <div className={styles.divider} />

                <nav aria-label="Project" className={styles.projectLinks}>
                  {projectLinks.map(({ label, href, Icon }) => (
                    <a
                      key={label}
                      className={styles.projectLink}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Icon aria-hidden />
                      {label}
                    </a>
                  ))}
                </nav>
              </div>
            </div>
          </Presence>
        </div>
      </Portal>
    </>
  )
}

function MobileDocs() {
  const pathname = usePathname()
  const service = useMachine(tabs.machine, {
    id: "mobile-docs-tabs",
    defaultValue: getActiveTab(pathname).id,
  })
  const api = tabs.connect(service, normalizeProps)

  return (
    <section aria-label="Docs" {...api.getRootProps()}>
      <div className={styles.sections} {...api.getListProps()}>
        {docsTabs.map((tab) => (
          <button
            key={tab.id}
            className={styles.sectionTab}
            {...api.getTriggerProps({ value: tab.id })}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={styles.frameworkRow}>
        Framework
        <FrameworkSelect id="mobile-framework-select" />
      </div>
      {docsTabs.map((tab) => (
        <div
          key={tab.id}
          className={styles.pages}
          {...api.getContentProps({ value: tab.id })}
        >
          <Sidebar tabId={tab.id} />
        </div>
      ))}
    </section>
  )
}
