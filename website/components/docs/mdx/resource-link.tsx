import { apgPatterns } from "lib/apg"
import {
  LuAccessibility,
  LuArrowUpRight,
  LuCode,
  LuPackage,
} from "react-icons/lu"
import { cx } from "styled-system/css"
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
      <a
        href={item.npmUrl}
        target="_blank"
        rel="noreferrer"
        className={styles.action}
      >
        <LuPackage aria-hidden />
        <span className={styles.mono}>{pkg}</span>
        <span className={styles.version}>{item.version}</span>
      </a>
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
        View source
        <Arrow />
      </a>
      {pattern && (
        <a
          href={pattern.url}
          target="_blank"
          rel="noreferrer"
          className={cx(styles.action, styles.accent)}
        >
          <LuAccessibility aria-hidden />
          WAI-ARIA {pattern.label}
          <Arrow />
        </a>
      )}
    </div>
  )
}
