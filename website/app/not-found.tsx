import { Footer } from "components/footer"
import { TopNav } from "components/nav/top-nav"
import { componentsHref } from "lib/pagination-utils"
import Link from "next/link"
import { LuArrowRight } from "react-icons/lu"
import { button } from "styled-system/recipes"
import * as styles from "./not-found.css"

export default function NotFound() {
  return (
    <>
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
        <h1 className={styles.title}>
          This page isn&apos;t in any state we know
        </h1>
        <p className={styles.lead}>
          The link may be old, or the page moved. These places definitely exist.
        </p>

        <div className={styles.actions}>
          <Link href="/" className={button({ variant: "solid" })}>
            Go home
          </Link>
          <Link
            href="/overview/introduction"
            className={button({ variant: "outline" })}
          >
            Read the docs
          </Link>
          <Link
            href={componentsHref}
            className={button({ variant: "outline" })}
          >
            Browse components
          </Link>
        </div>

        <p className={styles.hint}>
          Looking for something? Press <kbd className={styles.kbd}>⌘K</kbd> to
          search.
        </p>
      </main>
      <Footer />
    </>
  )
}
