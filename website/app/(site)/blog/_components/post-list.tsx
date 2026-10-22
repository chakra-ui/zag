"use client"

import * as select from "@zag-js/select"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import {
  accentDot,
  AuthorLine,
  eyebrow,
  shortDate,
} from "app/(site)/blog/_components/blog"
import type { Post } from "lib/source"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useId } from "react"
import { LuCheck, LuChevronDown } from "react-icons/lu"
import { css } from "styled-system/css"
import { Box, Grid, HStack, Stack, styled } from "styled-system/jsx"

export type PostSummary = Omit<Post, "toc">

const filters = [
  { label: "Everything", value: "all" },
  { label: "Articles", value: "articles" },
  { label: "Releases", value: "releases" },
]

const collection = select.collection({ items: filters })

export function PostList({ posts }: { posts: PostSummary[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const type = searchParams.get("type") ?? "all"
  const filter = filters.some((item) => item.value === type) ? type : "all"

  const service = useMachine(select.machine, {
    id: useId(),
    collection,
    value: [filter],
    positioning: { sameWidth: true, gutter: 6 },
    onValueChange({ value }) {
      const params = new URLSearchParams(searchParams)
      if (value[0] && value[0] !== "all") params.set("type", value[0])
      else params.delete("type")
      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      })
    },
  })
  const api = select.connect(service, normalizeProps)

  const visible = posts.filter((post) =>
    filter === "all"
      ? true
      : filter === "releases"
        ? post.type === "release"
        : post.type === "article",
  )
  const years = [...new Set(visible.map((post) => post.date.getUTCFullYear()))]

  return (
    <Box>
      <HStack
        justify="space-between"
        flexWrap="wrap"
        gap="4"
        px={{ base: "4", sm: "6", md: "10" }}
        py="4"
        borderTopWidth="1px"
        borderColor="border"
      >
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()} className={css({ srOnly: true })}>
            Filter posts
          </label>
          <div {...api.getControlProps()}>
            <button {...api.getTriggerProps()} className={trigger}>
              {api.valueAsString}
              <LuChevronDown aria-hidden className={chevron} />
            </button>
          </div>
          <Portal>
            <div {...api.getPositionerProps()}>
              <div {...api.getContentProps()} className={menu}>
                <div {...api.getListProps()}>
                  {filters.map((item) => (
                    <div
                      key={item.value}
                      {...api.getItemProps({ item })}
                      className={option}
                    >
                      <span {...api.getItemTextProps({ item })}>
                        {item.label}
                      </span>
                      <span {...api.getItemIndicatorProps({ item })}>
                        <LuCheck aria-hidden />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Portal>
        </div>
        <span className={eyebrow}>
          {visible.length} {visible.length === 1 ? "post" : "posts"}
        </span>
      </HStack>

      {visible.length === 0 && (
        <styled.p
          px={{ base: "4", sm: "6", md: "10" }}
          py="16"
          borderTopWidth="1px"
          borderColor="border"
          color="text.muted"
          fontFamily="mono"
          fontSize="13px"
        >
          No posts here yet.
        </styled.p>
      )}

      {years.map((year) => (
        <Box key={year} as="section" aria-labelledby={`year-${year}`}>
          <styled.h2
            id={`year-${year}`}
            className={eyebrow}
            position="sticky"
            top="16"
            zIndex="1"
            bg="bg"
            px={{ base: "4", sm: "6", md: "10" }}
            py="3"
            borderTopWidth="1px"
            borderColor="border"
          >
            {year}
          </styled.h2>
          {visible
            .filter((post) => post.date.getUTCFullYear() === year)
            .map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className={row}>
                <Grid
                  columns={{ base: 1, md: 12 }}
                  gap={{ base: "3", md: "8" }}
                  alignItems="baseline"
                >
                  <Stack
                    gap="2"
                    gridColumn={{ md: "span 3", lg: "span 2" }}
                    className={eyebrow}
                    direction={{ base: "row", md: "column" }}
                  >
                    <time dateTime={post.date.toISOString()}>
                      {shortDate(post.date)}
                    </time>
                    {post.type === "release" && (
                      <styled.span
                        display="inline-flex"
                        alignItems="center"
                        gap="1.5"
                      >
                        <span className={accentDot} />
                        Release
                      </styled.span>
                    )}
                  </Stack>
                  <Stack gap="2" gridColumn={{ md: "span 9", lg: "span 7" }}>
                    <styled.span
                      fontSize={{ base: "18px", md: "20px" }}
                      fontWeight="semibold"
                      letterSpacing="-0.02em"
                      lineHeight="1.3"
                      color="text.bold"
                      textWrap="balance"
                    >
                      {post.title}
                    </styled.span>
                    <styled.span
                      fontSize="15px"
                      color="text.muted"
                      lineHeight="1.6"
                      maxW="62ch"
                      textWrap="pretty"
                    >
                      {post.description}
                    </styled.span>
                  </Stack>
                  <Box
                    gridColumn={{ md: "4 / span 9", lg: "span 3" }}
                    justifySelf={{ lg: "end" }}
                  >
                    <AuthorLine
                      authors={post.authors}
                      readingTime={post.readingTime}
                    />
                  </Box>
                </Grid>
              </Link>
            ))}
        </Box>
      ))}
    </Box>
  )
}

const row = css({
  display: "block",
  px: { base: "4", sm: "6", md: "10" },
  py: { base: "6", md: "8" },
  borderTopWidth: "1px",
  borderColor: "border",
  transition: "background 150ms",
  _hover: { bg: "bg.muted" },
  _focusVisible: {
    outline: "2px solid",
    outlineColor: "text.bold",
    outlineOffset: "-2px",
  },
})

const trigger = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "3",
  minW: "11rem",
  h: "9",
  px: "3",
  fontFamily: "mono",
  fontSize: "12px",
  color: "text.bold",
  rounded: "md",
  bg: "bg",
  borderWidth: "1px",
  borderColor: "border",
  cursor: "pointer",
  transition: "background-color 150ms",
  _hover: { bg: "bg.muted" },
  _expanded: { bg: "bg.muted", borderColor: "border.bold" },
  _focusVisible: {
    outline: "2px solid",
    outlineColor: "text.bold",
    outlineOffset: "2px",
  },
})

const chevron = css({
  color: "text.subtle",
  transition: "transform 150ms",
  "[aria-expanded=true] &": { transform: "rotate(180deg)" },
})

const menu = css({
  zIndex: "20",
  py: "1",
  rounded: "md",
  bg: "bg",
  borderWidth: "1px",
  borderColor: "border",
  boxShadow: "lg",
  outline: "none",
})

const option = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "3",
  px: "3",
  py: "2",
  fontFamily: "mono",
  fontSize: "12px",
  color: "text.muted",
  cursor: "pointer",
  _highlighted: { bg: "bg.muted", color: "text.bold" },
  _selected: { color: "text.bold" },
})
