import { Footer } from "components/footer"
import { TopNav } from "components/nav/top-nav"
import Link from "next/link"
import { LuArrowRight } from "react-icons/lu"
import { button } from "styled-system/recipes"
import * as styles from "./not-found.css"

export default function NotFound() {
  return (
    <div className={styles.page}>
      <TopNav />
      <main className={styles.main}>
        <div className={styles.machine} aria-hidden>
          <span className={styles.state}>visiting</span>
          <span className={styles.edge}>
            NAVIGATE
            <LuArrowRight />
          </span>
          <span className={styles.missing}>not_found</span>
        </div>

        <p className={styles.code}>404</p>
        <h1 className={styles.title}>We couldn&apos;t find that page</h1>
        <p className={styles.lead}>
          It may have moved or been renamed. Search the docs or start from the
          introduction.
        </p>

        <div className={styles.actions}>
          <Link
            href="/overview/introduction"
            className={button({ variant: "solid" })}
          >
            Read the docs
          </Link>
          <Link href="/" className={button({ variant: "outline" })}>
            Go home
          </Link>
        </div>

        <p className={styles.hint}>
          Press <kbd className={styles.kbd}>⌘K</kbd> to search
        </p>
      </main>
      <Footer />
    </div>
  )
}
