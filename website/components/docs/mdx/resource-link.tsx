import { apgPatterns } from "lib/apg"
import { LuAccessibility, LuArrowUpRight, LuCode } from "react-icons/lu"
import { MachineDiagram } from "../machine-diagram"
import * as styles from "./resource-link.css"

interface ResourceLinkItem {
  npmUrl: string
  version: string
  logicUrl?: string
  sourceUrl: string
}

const Arrow = () => <LuArrowUpRight className={styles.arrow} aria-hidden />

export function ResourceLinkGroup(props: {
  pkg: string
  item: ResourceLinkItem
}) {
  const { pkg, item } = props
  const pattern = apgPatterns[pkg]

  return (
    <div className={styles.root}>
      {item.logicUrl && (
        <MachineDiagram
          url={item.logicUrl}
          name={pkg.replace("@zag-js/", "")}
        />
      )}
      <a
        href={item.sourceUrl}
        target="_blank"
        rel="noreferrer"
        className={styles.action}
      >
        <LuCode aria-hidden />
        Source
        <Arrow />
      </a>
      {pattern && (
        <a
          href={pattern.url}
          target="_blank"
          rel="noreferrer"
          className={styles.action}
          aria-label={`WAI-ARIA ${pattern.label} pattern`}
          title={`WAI-ARIA ${pattern.label} pattern`}
        >
          <LuAccessibility aria-hidden />
          WAI-ARIA
          <Arrow />
        </a>
      )}
    </div>
  )
}
