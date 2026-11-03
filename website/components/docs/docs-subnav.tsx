"use client"

import { getActiveTab, tabHref } from "lib/pagination-utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { tabs } from "sidebar.config"
import * as styles from "./docs-subnav.css"
import { useFramework } from "./framework"
import { FrameworkSelect } from "./framework-select"

export function DocsSubnav() {
  const pathname = usePathname()
  const active = getActiveTab(pathname)
  const { framework } = useFramework()

  return (
    <div className={styles.root}>
      <div className={styles.inner}>
        <nav aria-label="Documentation sections" className={styles.tabs}>
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={tabHref(tab, framework)}
              aria-current={tab.id === active.id ? "page" : undefined}
              className={styles.tab}
            >
              <span>
                <tab.icon aria-hidden />
                {tab.label}
              </span>
            </Link>
          ))}
        </nav>
        <FrameworkSelect />
      </div>
    </div>
  )
}
