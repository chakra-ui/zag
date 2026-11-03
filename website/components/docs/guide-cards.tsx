import Link from "next/link"
import type { IconType } from "react-icons"
import {
  LuBlocks,
  LuBookOpen,
  LuCode,
  LuPalette,
  LuPuzzle,
  LuWrench,
} from "react-icons/lu"
import * as styles from "./guide-cards.css"

const icons: Record<string, IconType> = {
  code: LuCode,
  blocks: LuBlocks,
  palette: LuPalette,
  puzzle: LuPuzzle,
  wrench: LuWrench,
  book: LuBookOpen,
}

export interface GuideCardItem {
  title: string
  description: string
  href: string
  icon?: keyof typeof icons
  /** what the page produces, shown as a code chip */
  result?: string
}

/** Numbered cards for the pages of a guide section, in reading order */
export function GuideCards(props: { items: GuideCardItem[] }) {
  return (
    <ol className={styles.root}>
      {props.items.map((item, index) => {
        const Icon = icons[item.icon ?? "book"]
        return (
          <li key={item.href}>
            <Link href={item.href} className={styles.card}>
              <span className={styles.top}>
                <span className={styles.icon}>
                  <Icon aria-hidden />
                </span>
                <span className={styles.step} aria-hidden>
                  {index + 1}
                </span>
              </span>
              <span className={styles.title}>{item.title}</span>
              <span className={styles.description}>{item.description}</span>
              {item.result && (
                <code className={styles.result}>{item.result}</code>
              )}
            </Link>
          </li>
        )
      })}
    </ol>
  )
}
