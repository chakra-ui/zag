"use client"

import * as select from "@zag-js/select"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { AuthorLine, eyebrow } from "components/blog"
import type { Post } from "lib/source"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useId } from "react"
import { LuCheck, LuChevronDown } from "react-icons/lu"
import { css } from "styled-system/css"
import { Box, HStack, Stack, styled } from "styled-system/jsx"

export type PostSummary = Omit<Post, "toc">

const filters = [
  { label: "Everything", value: "all" },
  { label: "Articles", value: "articles" },
  { label: "Releases", value: "releases" },
]

const collection = select.collection({ items: filters })

const shortDate = (date: Date) =>
  date
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    })
    .toUpperCase()

/** Posts grouped by year, filtered by type through `?type=articles|releases` */
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
    <Box mt="12">
      <HStack justify="space-between" flexWrap="wrap" gap="4" mb="8">
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
        <styled.p py="10" color="text.muted">
          No posts here yet.
        </styled.p>
      )}

      {years.map((year) => (
        <Box key={year} mb="8" _last={{ mb: "0" }}>
          <styled.h2
            fontSize="md"
            fontWeight="semibold"
            color="text.subtle"
            position="sticky"
            top="16"
            bg="bg"
            py="2"
            borderBottomWidth="1px"
            borderColor="border"
            zIndex="1"
          >
            {year}
          </styled.h2>
          <Stack gap="0" mt="1" mx="-4" rounded="lg" overflow="hidden">
            {visible
              .filter((post) => post.date.getUTCFullYear() === year)
              .map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className={row}
                >
                  <Stack gap="2">
                    <HStack gap="2" className={eyebrow}>
                      <time dateTime={post.date.toISOString()}>
                        {shortDate(post.date)}
                      </time>
                      {post.type === "release" && (
                        <styled.span
                          bg="bg.muted"
                          color="text"
                          rounded="sm"
                          px="1.5"
                          py="0.5"
                        >
                          Release
                        </styled.span>
                      )}
                    </HStack>
                    <styled.span
                      fontSize="xl"
                      fontWeight="semibold"
                      lineHeight="1.3"
                    >
                      {post.title}
                    </styled.span>
                    <styled.span
                      fontSize="sm"
                      color="text.muted"
                      lineHeight="1.6"
                    >
                      {post.description}
                    </styled.span>
                    <AuthorLine
                      authors={post.authors}
                      readingTime={post.readingTime}
                    />
                  </Stack>
                </Link>
              ))}
          </Stack>
        </Box>
      ))}
    </Box>
  )
}

const row = css({
  display: "block",
  py: "5",
  px: "4",
  transition: "background-color 150ms",
  _hover: { bg: "bg.subtle" },
  // one hairline between rows, none above the first
  "& + &": { borderTopWidth: "1px", borderColor: "border" },
})

const trigger = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "3",
  minW: "12rem",
  h: "11",
  px: "4",
  rounded: "md",
  fontSize: "sm",
  fontWeight: "medium",
  bg: "bg",
  borderWidth: "1px",
  borderColor: "border",
  cursor: "pointer",
  transition: "background-color 150ms",
  _hover: { bg: "bg.subtle" },
  _expanded: { bg: "bg.subtle" },
  _focusVisible: {
    outline: "2px solid",
    outlineColor: "green.500",
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
  px: "4",
  py: "2",
  fontSize: "sm",
  cursor: "pointer",
  _highlighted: { bg: "bg.subtle" },
  _selected: { fontWeight: "medium" },
})
