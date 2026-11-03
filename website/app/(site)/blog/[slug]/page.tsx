import { absoluteUrl, JsonLd } from "components/json-ld"
import { mdxComponents } from "components/docs/mdx-components"
import { PostActions } from "app/(site)/blog/_components/post-actions"
import { PostCover } from "app/(site)/blog/_components/post-cover"
import { Chip } from "components/ui/chip"
import { TableOfContents } from "components/docs/toc"
import { createPageMetadata } from "lib/seo"
import { getPostBody, posts } from "lib/source"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import siteConfig from "site.config"
import { Box } from "styled-system/jsx"
import { blogPost } from "styled-system/recipes"
import { gutter } from "../../_components/shared"

type PageProps = {
  params: Promise<{ slug: string }>
}

export const dynamicParams = false

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = posts.find((post) => post.slug === slug)
  if (!post) return {}
  return createPageMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${slug}`,
    image: `/og/blog/${slug}.png`,
    publishedTime: post.date,
  })
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params
  const post = posts.find((post) => post.slug === slug)
  const Body = getPostBody(slug)
  if (!post || !Body) notFound()
  const index = posts.indexOf(post)
  const newer = posts[index - 1]
  const older = posts[index + 1]

  const styles = blogPost()
  const date = post.date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })

  return (
    <Box px={gutter}>
      <JsonLd
        data={{
          "@type": "BlogPosting",
          headline: post.title,
          description: post.description,
          datePublished: post.date.toISOString(),
          url: absoluteUrl(`/blog/${slug}`),
          image: absoluteUrl(`/og/blog/${slug}.png`),
          author: post.authors.map((author) => ({
            "@type": "Person",
            name: author.name,
            url: `https://github.com/${author.github}`,
          })),
        }}
      />
      <div className={styles.root}>
        <article className={styles.article}>
          <Link href="/blog" className={styles.back}>
            ← All posts
          </Link>
          <div className={styles.meta}>
            <Chip tone={post.type === "release" ? "accent" : "neutral"}>
              {post.type}
            </Chip>
            <span className={styles.date}>
              <time dateTime={post.date.toISOString()}>{date}</time> ·{" "}
              {post.readingTime} min read
            </span>
          </div>
          <h1 className={styles.title}>{post.title}</h1>
          <p className={styles.lead}>{post.description}</p>
          {post.cover && <PostCover cover={post.cover} />}
          <div className={styles.authors}>
            {post.authors.map((author) => (
              <a
                key={author.github}
                href={`https://github.com/${author.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.author}
              >
                <img
                  src={`https://github.com/${author.github}.png?size=64`}
                  alt=""
                  width={28}
                  height={28}
                  className={styles.avatar}
                />
                {author.name}
              </a>
            ))}
            <PostActions slug={slug} title={post.title} />
          </div>
          <div className={`mdx-content ${styles.prose}`}>
            <Body components={mdxComponents} />
          </div>
          <nav aria-label="More posts" className={styles.pager}>
            {older ? (
              <Link href={`/blog/${older.slug}`} className={styles.pagerLink}>
                <span className={styles.pagerLabel}>Older</span>
                <span className={styles.pagerTitle} data-part="title">
                  ← {older.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {newer && (
              <Link
                href={`/blog/${newer.slug}`}
                className={styles.pagerLink}
                data-end=""
              >
                <span className={styles.pagerLabel}>Newer</span>
                <span className={styles.pagerTitle} data-part="title">
                  {newer.title} →
                </span>
              </Link>
            )}
          </nav>
        </article>

        <aside className={styles.aside}>
          <div className={styles.sticky}>
            {post.toc.length > 1 && <TableOfContents data={post.toc} />}
            <div className={styles.asideLinks}>
              <a
                href={`${siteConfig.repo.editUrl}/blog/${slug}.mdx`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.asideLink}
              >
                Edit on GitHub ↗
              </a>
              <Link
                href="/blog/rss.xml"
                prefetch={false}
                className={styles.asideLink}
              >
                Subscribe via RSS ↗
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </Box>
  )
}
