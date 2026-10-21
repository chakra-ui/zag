"use client"

import { useScrollSpy } from "lib/use-scrollspy"
import Link from "next/link"
import { Stack, styled } from "styled-system/jsx"

const TocLink = styled(Link)

type TOC = Array<{
  content: string
  slug: string
  lvl: number
}>

export function TableOfContents({
  data = [],
  title = "On this page",
  getSlug = (slug) => `#${slug}`,
}: {
  data: TOC
  title?: string
  getSlug?: (slug: string) => string
}) {
  const activeId = useScrollSpy(data.map((item) => `[id="${item.slug}"]`))

  return (
    <nav className="toc" aria-labelledby="toc-heading">
      <styled.h5
        id="toc-heading"
        fontSize="xs"
        fontWeight="semibold"
        textTransform="uppercase"
        letterSpacing="wide"
        color="text.bold"
        className="toc__heading"
      >
        {title}
      </styled.h5>

      {/* same rail as the sidebar: muted items, the active one marked in green */}
      <Stack
        as="ul"
        mt="3"
        gap="0"
        listStyleType="none"
        borderStartWidth="1px"
        borderColor="border"
      >
        {data.map((item, index) => {
          const active = activeId === item.slug
          return (
            <li key={item.slug + index}>
              <TocLink
                href={getSlug(item.slug)}
                aria-current={active ? "location" : undefined}
                display="block"
                py="1"
                marginStart="-1px"
                paddingStart={item.lvl > 2 ? "7" : "4"}
                borderStartWidth="1px"
                borderStartColor="transparent"
                fontSize="13px"
                lineHeight="1.45"
                color="text.muted"
                transition="color 120ms, border-color 120ms"
                _hover={{ color: "text", borderStartColor: "border.bold" }}
                css={{
                  "&[aria-current]": {
                    color: "text.bold",
                    borderStartColor: "green.500",
                  },
                }}
                _focusVisible={{
                  outline: "2px solid",
                  outlineColor: "border.primary.bold",
                  outlineOffset: "-2px",
                }}
              >
                {item.content}
              </TocLink>
            </li>
          )
        })}
      </Stack>
    </nav>
  )
}
