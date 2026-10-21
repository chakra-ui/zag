import {
  accentDot,
  AuthorLine,
  eyebrow,
  monoLink,
  shortDate,
} from "app/(site)/blog/_components/blog"
import { absoluteUrl, JsonLd } from "components/json-ld"
import { mdxComponents } from "components/docs/mdx-components"
import { Band, Eyebrow, Frame, Lead, Pad, Title } from "components/ui/layout"
import { cells } from "components/ui/cells"
import { TableOfContents } from "components/docs/toc"
import { createPageMetadata } from "lib/seo"
import { getPostBody, posts } from "lib/source"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { css } from "styled-system/css"
import { Box, Grid, HStack, styled } from "styled-system/jsx"

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
      <Frame>
        <Pad pb={{ base: "10", md: "14" }}>
          <Link href="/blog" className={monoLink}>
            ← blog
          </Link>
          <Box maxW="72ch" mt={{ base: "8", md: "10" }}>
            <HStack gap="2.5" flexWrap="wrap" className={eyebrow}>
              {post.type === "release" && (
                <>
                  <styled.span
                    display="inline-flex"
                    alignItems="center"
                    gap="1.5"
                  >
                    <span className={accentDot} />
                    Release
                  </styled.span>
                  <span aria-hidden>·</span>
                </>
              )}
              <time dateTime={post.date.toISOString()}>
                {shortDate(post.date)}
              </time>
              <span aria-hidden>·</span>
              <span>{post.readingTime} min read</span>
            </HStack>
            <Title as="h1" mt="4" fontSize={{ base: "32px", md: "44px" }}>
              {post.title}
            </Title>
            <Lead mt="4" maxW="62ch">
              {post.description}
            </Lead>
            <Box mt="8">
              <AuthorLine authors={post.authors} linked />
            </Box>
          </Box>
        </Pad>

        <Band>
          <Box display="flex" position="relative">
            <Box
              as="article"
              flex="1"
              minW="0"
              px={{ base: "4", sm: "6", md: "10" }}
              py={{ base: "10", md: "14" }}
            >
              <Box className={prose}>
                <div className="mdx-content">
                  <Body components={mdxComponents} />
                </div>
              </Box>
            </Box>

            {post.toc.length > 1 && (
              <Box
                as="aside"
                hideBelow="xl"
                flexShrink="0"
                w="64"
                borderLeftWidth="1px"
                borderColor="border"
              >
                <Box
                  position="sticky"
                  top="calc(4rem + 2rem)"
                  px="6"
                  py="14"
                  className={tocStyles}
                >
                  <TableOfContents data={post.toc} />
                </Box>
              </Box>
            )}
          </Box>
        </Band>

        <Grid className={cells} gap="1px" columns={{ base: 1, md: 2 }}>
          {older ? (
            <Link href={`/blog/${older.slug}`} className={pager}>
              <Eyebrow>← Older</Eyebrow>
              <styled.span
                fontSize="16px"
                fontWeight="semibold"
                color="text.bold"
              >
                {older.title}
              </styled.span>
            </Link>
          ) : (
            <Link href="/blog" className={pager}>
              <Eyebrow>← Index</Eyebrow>
              <styled.span
                fontSize="16px"
                fontWeight="semibold"
                color="text.bold"
              >
                All posts
              </styled.span>
            </Link>
          )}
          {newer ? (
            <Link href={`/blog/${newer.slug}`} className={pager} data-end="">
              <Eyebrow>Newer →</Eyebrow>
              <styled.span
                fontSize="16px"
                fontWeight="semibold"
                color="text.bold"
              >
                {newer.title}
              </styled.span>
            </Link>
          ) : (
            <Link
              href="/blog/rss.xml"
              prefetch={false}
              className={pager}
              data-end=""
            >
              <Eyebrow>Latest post</Eyebrow>
              <styled.span
                fontSize="16px"
                fontWeight="semibold"
                color="text.bold"
              >
                Subscribe via rss.xml ↗
              </styled.span>
            </Link>
          )}
        </Grid>
      </Frame>
    </Box>
  )
}

const pager = css({
  display: "flex",
  flexDirection: "column",
  gap: "3",
  px: { base: "4", sm: "6", md: "10" },
  py: { base: "8", md: "10" },
  transition: "background 150ms",
  _hover: { bg: "bg.muted" },
  "&[data-end]": { md: { alignItems: "end", textAlign: "end" } },
  _focusVisible: {
    outline: "2px solid",
    outlineColor: "text.bold",
    outlineOffset: "-2px",
  },
})

const tocStyles = css({
  "& .toc__heading": {
    fontFamily: "mono",
    fontSize: "11px",
    fontWeight: "normal",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "text.muted",
  },
})

const prose = css({
  color: "text",
  fontSize: "16px",
  "& .mdx-content > p:first-child": {
    fontSize: "17px",
    color: "text.bold",
  },
  "& .mdx-content :is(h2, h3)": {
    color: "text.bold",
    letterSpacing: "-0.02em",
    textWrap: "balance",
  },
  "& .mdx-content > h2": {
    mt: "14",
    pt: "8",
    borderTopWidth: "1px",
    borderColor: "border",
  },
  "& .mdx-content li::marker": {
    color: "text.muted",
  },
  "& .mdx-content hr": {
    my: "10",
    borderColor: "border",
  },
  "& .mdx-content img": {
    maxW: "100%",
    h: "auto",
  },
})
