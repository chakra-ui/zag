import { HiArrowLeft } from "react-icons/hi"
import { AuthorLine, eyebrow } from "components/blog"
import { Footer } from "components/footer"
import { absoluteUrl, JsonLd } from "components/json-ld"
import { mdxComponents } from "components/mdx-components"
import { TopNav } from "components/nav/top-nav"
import { TableOfContents } from "components/toc"
import { formatDate } from "lib/format-date"
import { createPageMetadata } from "lib/seo"
import { getPostBody, posts } from "lib/source"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { LuRss } from "react-icons/lu"
import { css, cx } from "styled-system/css"
import { Box, HStack, Stack, styled } from "styled-system/jsx"

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

  return (
    <Box>
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
      <TopNav />
      <Box maxW="8xl" mx="auto" display="flex" position="relative">
        <Box
          as="article"
          flex="1"
          minW="0"
          px={{ base: "4", lg: "10" }}
          pt={{ base: "8", md: "10" }}
        >
          <Box maxW="3xl" mx="auto">
            <Link
              href="/blog"
              className={css({
                display: "inline-flex",
                alignItems: "center",
                gap: "1.5",
                fontSize: "sm",
                color: "text.muted",
                mb: "6",
                _hover: { color: "text" },
              })}
            >
              <HiArrowLeft aria-hidden />
              All posts
            </Link>

            <Stack gap="3" mb="10">
              <styled.h1 textStyle="display.xl">{post.title}</styled.h1>
              <styled.p fontSize="lg" color="text.muted">
                {post.description}
              </styled.p>
              <HStack justify="space-between" flexWrap="wrap" gap="3">
                <HStack gap="3" flexWrap="wrap">
                  <time dateTime={post.date.toISOString()} className={eyebrow}>
                    {formatDate(post.date)}
                  </time>
                  <styled.span aria-hidden color="text.subtle">
                    ·
                  </styled.span>
                  <span className={eyebrow}>{post.readingTime} min read</span>
                </HStack>
                <Link
                  href="/blog/rss.xml"
                  prefetch={false}
                  aria-label="Subscribe to the RSS feed"
                  className={cx(
                    eyebrow,
                    css({
                      display: "flex",
                      alignItems: "center",
                      gap: "2",
                      _hover: { color: "text" },
                    }),
                  )}
                >
                  <LuRss size={14} aria-hidden />
                  RSS
                </Link>
              </HStack>
              <Box pt="3">
                <AuthorLine authors={post.authors} linked />
              </Box>
            </Stack>

            <div className="mdx-content">
              <Body components={mdxComponents} />
            </div>
          </Box>
        </Box>

        {post.toc.length > 1 && (
          <Box
            hideBelow="xl"
            flexShrink="0"
            w="56"
            position="sticky"
            top="calc(4rem + 2rem)"
            alignSelf="flex-start"
            pt="10"
            pe="8"
          >
            <TableOfContents data={post.toc} />
          </Box>
        )}
      </Box>
      <Footer />
    </Box>
  )
}
