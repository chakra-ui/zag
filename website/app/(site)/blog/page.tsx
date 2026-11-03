import { PostCover } from "app/(site)/blog/_components/post-cover"
import { PostFilters, PostList } from "app/(site)/blog/_components/post-list"
import { Chip } from "components/ui/chip"
import { TwoToneHeading } from "components/ui/heading"
import { createPageMetadata } from "lib/seo"
import { posts } from "lib/source"
import Link from "next/link"
import { Suspense } from "react"
import { Box } from "styled-system/jsx"
import { blogIndex, pageHeader } from "styled-system/recipes"
import { gutter } from "../_components/shared"

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
  const header = pageHeader()
  const styles = blogIndex()
  const featured = posts.find((post) => post.featured) ?? posts[0]
  const rest = posts
    .filter((post) => post !== featured)
    .map(({ toc: _toc, ...post }) => post)

  return (
    <Box maxW="1440px" mx="auto" px={gutter} pb="24">
      <header className={header.root}>
        <div className={header.copy}>
          <p className={header.eyebrow}>Blog</p>
          <TwoToneHeading
            as="h1"
            title="Notes from the"
            accent="machine room"
            size="display"
          />
          <p className={header.lead}>
            Releases, design decisions and how-to builds from the Zag team.{" "}
            <Link href="/blog/rss.xml" prefetch={false}>
              RSS ↗
            </Link>
          </p>
        </div>
        <Suspense>
          <PostFilters />
        </Suspense>
      </header>

      {featured && (
        <Link href={`/blog/${featured.slug}`} className={styles.featured}>
          {featured.cover ? (
            <PostCover cover={featured.cover} size="md" />
          ) : (
            <span className={styles.cover} aria-hidden>
              <span className={styles.coverMeta}>{featured.type}</span>
              <span className={styles.coverLabel}>{featured.title}</span>
              <span className={styles.coverFoot}>
                {featured.readingTime} min read
              </span>
            </span>
          )}
          <span className={styles.featuredBody}>
            <span className={styles.meta}>
              <Chip tone="accent">{featured.type}</Chip>
              <time
                dateTime={featured.date.toISOString()}
                className={styles.date}
              >
                {longDate(featured.date)}
              </time>
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

      <Box mt="12">
        <Suspense>
          <PostList posts={rest} />
        </Suspense>
      </Box>
    </Box>
  )
}
