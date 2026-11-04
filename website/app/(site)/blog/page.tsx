import { PostCover } from "app/(site)/blog/_components/post-cover"
import { PostFilters, PostList } from "app/(site)/blog/_components/post-list"
import { PageHeader, pageContainer } from "components/page/page-header"
import { createPageMetadata } from "lib/seo"
import { posts } from "lib/source"
import Link from "next/link"
import { Suspense } from "react"
import * as styles from "./blog.css"

export const metadata = createPageMetadata({
  title: "Blog",
  description: "Release notes, deep dives and updates from the Zag team.",
  path: "/blog",
})

const longDate = (date: Date) =>
  date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })

export default function BlogPage() {
  const featured = posts.find((post) => post.featured) ?? posts[0]
  const rest = posts
    .filter((post) => post !== featured)
    .map(({ toc: _toc, ...post }) => post)

  return (
    <div className={pageContainer}>
      <PageHeader
        title="Blog"
        lead={
          <>
            Releases, design decisions and how-to builds from the Zag team.
            Follow along with the{" "}
            <Link href="/blog/rss.xml" prefetch={false} className={styles.rss}>
              RSS feed
            </Link>
            .
          </>
        }
        action={
          <Suspense>
            <PostFilters />
          </Suspense>
        }
      />

      {featured && (
        <Link href={`/blog/${featured.slug}`} className={styles.featured}>
          {featured.cover && <PostCover cover={featured.cover} size="md" />}
          <span className={styles.featuredBody}>
            <span className={styles.meta}>
              <span className={styles.typePill({ type: featured.type })}>
                {featured.type}
              </span>
              <time dateTime={featured.date.toISOString()}>
                {longDate(featured.date)}
              </time>
              <span aria-hidden>·</span>
              <span>{featured.readingTime} min read</span>
            </span>
            <span className={styles.featuredTitle}>{featured.title}</span>
            <span className={styles.featuredLead}>{featured.description}</span>
            <span className={styles.featuredCta} data-part="cta">
              {featured.type === "release"
                ? "Read the release"
                : "Read the post"}{" "}
              →
            </span>
          </span>
        </Link>
      )}

      <Suspense>
        <PostList posts={rest} />
      </Suspense>
    </div>
  )
}
