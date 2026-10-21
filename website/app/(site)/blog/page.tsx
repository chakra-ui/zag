import {
  accentDot,
  AuthorLine,
  eyebrow,
  monoLink,
  shortDate,
} from "components/blog"
import { Band, Eyebrow, Frame, Lead, Pad, Title } from "components/ui/layout"
import { PostList } from "components/post-list"
import { createPageMetadata } from "lib/seo"
import { posts } from "lib/source"
import Link from "next/link"
import { Suspense } from "react"
import { css, cx } from "styled-system/css"
import { Box, Grid, HStack, Stack, styled } from "styled-system/jsx"

export const metadata = createPageMetadata({
  title: "Blog",
  description: "Release notes, deep dives and updates from the Zag team.",
  path: "/blog",
})

export default function BlogPage() {
  const featured = posts.find((post) => post.featured) ?? posts[0]

  return (
    <Box>
      <Frame>
        <Pad>
          <Eyebrow mb="3">Blog · {posts.length} posts</Eyebrow>
          <Title as="h1">Notes from the Zag team</Title>
          <Lead mt="4">
            Release notes, deep dives and how we build state machines for UI.
          </Lead>
          <Link
            href="/blog/rss.xml"
            prefetch={false}
            aria-label="Subscribe to the RSS feed"
            className={cx(monoLink, css({ display: "inline-block", mt: "6" }))}
          >
            rss.xml ↗
          </Link>
        </Pad>

        {featured && (
          <Band>
            <Link href={`/blog/${featured.slug}`} className={featuredCard}>
              <Grid
                columns={{ base: 1, lg: 12 }}
                gap={{ base: "6", lg: "10" }}
                alignItems="end"
              >
                <Stack gap="4" gridColumn={{ lg: "span 8" }}>
                  <HStack gap="2.5" className={eyebrow}>
                    <span className={accentDot} />
                    <span>{featured.featured ? "Featured" : "Latest"}</span>
                    <span aria-hidden>·</span>
                    <time dateTime={featured.date.toISOString()}>
                      {shortDate(featured.date)}
                    </time>
                    {featured.type === "release" && (
                      <>
                        <span aria-hidden>·</span>
                        <span>Release</span>
                      </>
                    )}
                  </HStack>
                  <styled.h2
                    fontSize={{ base: "26px", md: "34px" }}
                    lineHeight="1.12"
                    letterSpacing="-0.03em"
                    fontWeight="semibold"
                    color="text.bold"
                    textWrap="balance"
                  >
                    {featured.title}
                  </styled.h2>
                  <styled.p
                    fontSize={{ base: "15px", md: "17px" }}
                    lineHeight="1.6"
                    color="text.muted"
                    maxW="60ch"
                    textWrap="pretty"
                  >
                    {featured.description}
                  </styled.p>
                </Stack>
                <Stack
                  gap="4"
                  gridColumn={{ lg: "span 4" }}
                  alignItems={{ base: "start", lg: "end" }}
                >
                  <AuthorLine
                    authors={featured.authors}
                    readingTime={featured.readingTime}
                  />
                  <styled.span
                    fontFamily="mono"
                    fontSize="13px"
                    color="text.bold"
                  >
                    Read post →
                  </styled.span>
                </Stack>
              </Grid>
            </Link>
          </Band>
        )}

        <Suspense>
          <PostList posts={posts.map(({ toc: _toc, ...post }) => post)} />
        </Suspense>
      </Frame>
    </Box>
  )
}

const featuredCard = css({
  display: "block",
  px: { base: "4", sm: "6", md: "10" },
  py: { base: "10", md: "14" },
  bg: "bg.muted",
  transition: "background 150ms",
  _hover: { bg: "bg" },
  _focusVisible: {
    outline: "2px solid",
    outlineColor: "text.bold",
    outlineOffset: "-2px",
  },
})
