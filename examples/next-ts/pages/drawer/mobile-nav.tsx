import * as drawer from "@zag-js/drawer"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import { Presence } from "../../components/presence"
import styles from "../../../shared/styles/drawer-mobile-nav.module.css"

const NAV_ITEMS = [
  { href: "#", label: "Overview" },
  { href: "#", label: "Components" },
  { href: "#", label: "Utilities" },
  { href: "#", label: "Releases" },
]

const LONG_LIST = Array.from({ length: 50 }, (_, i) => ({
  href: "#",
  label: `Item ${i + 1}`,
}))

export default function Page() {
  const service = useMachine(drawer.machine, {
    id: useId(),
  })

  const api = drawer.connect(service, normalizeProps)

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <button {...api.getTriggerProps()} className={styles.menuButton}>
          Open mobile menu
        </button>
      </header>

      <Presence {...api.getBackdropProps()} className={styles.backdrop} />
      <div {...api.getPositionerProps()} className={styles.positioner}>
        <Presence {...api.getContentProps({ draggable: false })} className={styles.popup}>
          <nav className={styles.panel}>
            <div className={styles.panelHeader}>
              <div aria-hidden className={styles.headerSpacer} />
              <div {...api.getGrabberProps()} className={styles.handle}>
                <div {...api.getGrabberIndicatorProps()} className={styles.handleIndicator} />
              </div>
              <button {...api.getCloseTriggerProps()} className={styles.closeButton} aria-label="Close menu">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M0.75 0.75L6 6M11.25 11.25L6 6M6 6L0.75 11.25M6 6L11.25 0.75"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <h2 {...api.getTitleProps()} className={styles.title}>
              Menu
            </h2>
            <p {...api.getDescriptionProps()} className={styles.description}>
              Scroll the long list. Flick down from the top to dismiss.
            </p>

            <div className={styles.scrollArea}>
              <ul className={styles.navList}>
                {NAV_ITEMS.map((item) => (
                  <li key={item.label} className={styles.navItem}>
                    <a className={styles.navLink} href={item.href} onClick={() => api.setOpen(false)}>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>

              <ul className={styles.longList} aria-label="Long list">
                {LONG_LIST.map((item) => (
                  <li key={item.label} className={styles.navItem}>
                    <a className={styles.navLink} href={item.href} onClick={() => api.setOpen(false)}>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </Presence>
      </div>
    </main>
  )
}
