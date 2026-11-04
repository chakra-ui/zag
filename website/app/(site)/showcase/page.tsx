import { PageHeader, pageContainer } from "components/page/page-header"
import { createPageMetadata } from "lib/seo"
import { showcaseItems } from "lib/showcase"
import { ShowcaseCard } from "./_components/showcase-card"
import * as styles from "./showcase.css"

export const metadata = createPageMetadata({
  title: "Showcase",
  description:
    "Discover projects and design systems built with Zag.js state machines",
  path: "/showcase",
})

export default function ShowcasePage() {
  return (
    <div className={pageContainer}>
      <PageHeader
        title="Built with Zag"
        lead="Design systems, component libraries and apps that run on Zag."
      />

      <div className={styles.grid}>
        {showcaseItems.map((item) => (
          <ShowcaseCard key={item.href} item={item} />
        ))}
      </div>
    </div>
  )
}
