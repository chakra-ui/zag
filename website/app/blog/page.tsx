import { AuthorLine, eyebrow } from "components/blog"
import { Footer } from "components/footer"
import { TopNav } from "components/nav/top-nav"
import { createPageMetadata } from "lib/seo"
import { posts } from "lib/source"
import { PostList } from "components/post-list"
import Link from "next/link"
import { Suspense } from "react"
import { LuRss } from "react-icons/lu"
import { css, cx } from "styled-system/css"
import { Box, HStack, Stack, styled } from "styled-system/jsx"

export const metadata = createPageMetadata({
  title: "Blog",
  description: "Release notes, deep dives and updates from the Zag team.",
  path: "/blog",
})

export default function BlogPage() {
  // a post marked `featured` wins, otherwise the newest
  const featured = posts.find((post) => post.featured) ?? posts[0]

  return (
    <Box>
      <TopNav />
      <Box maxW="72rem" mx="auto" px="6" pt={{ base: "10", md: "14" }}>
        <HStack justify="space-between" alignItems="end" mb="8" gap="4">
          <styled.h1
            fontSize={{ base: "4xl", md: "5xl" }}
            fontWeight="bold"
            letterSpacing="tighter"
            lineHeight="1.05"
          >
            Latest Updates
          </styled.h1>
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

        {featured && (
          <Link
            href={`/blog/${featured.slug}`}
            className={css({
              display: "block",
              p: { base: "6", md: "8" },
              borderWidth: "1px",
              borderColor: "border",
              rounded: "lg",
              transition: "background-color 150ms",
              _hover: { bg: "bg.subtle" },
              _focusVisible: {
                outline: "2px solid",
                outlineColor: "green.500",
                outlineOffset: "2px",
              },
            })}
          >
            <HStack gap="3" mb="4" flexWrap="wrap">
              <styled.span
                className={eyebrow}
                bg="bg.primary.subtle"
                color="white"
                px="2"
                py="1"
              >
                {featured.featured ? "Featured" : "Latest"}
              </styled.span>
              <styled.span className={eyebrow}>
                {featured.date
                  .toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                    timeZone: "UTC",
                  })
                  .toUpperCase()}
              </styled.span>
            </HStack>
            <Stack gap="3" maxW="40rem">
              <styled.h2
                fontSize={{ base: "3xl", md: "4xl" }}
                fontWeight="bold"
                letterSpacing="tight"
                lineHeight="1.1"
              >
                {featured.title}
              </styled.h2>
              <styled.p textStyle="text.lg" color="text.muted">
                {featured.description}
              </styled.p>
              <AuthorLine
                authors={featured.authors}
                readingTime={featured.readingTime}
              />
            </Stack>
          </Link>
        )}

        <Suspense>
          <PostList posts={posts.map(({ toc: _toc, ...post }) => post)} />
        </Suspense>
      </Box>
      <Footer />
    </Box>
  )
}
