import type { Author } from "lib/source"
import { css } from "styled-system/css"
import { Box, HStack, Stack, styled } from "styled-system/jsx"

export const eyebrowStyles = css.raw({
  fontFamily: "mono",
  fontSize: "11px",
  fontWeight: "normal",
  lineHeight: "1",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "text.muted",
})

export const eyebrow = css(eyebrowStyles)

export const monoLink = css({
  fontFamily: "mono",
  fontSize: "13px",
  color: "text.muted",
  transition: "color 120ms",
  _hover: { color: "text.bold" },
  _focusVisible: {
    outline: "2px solid",
    outlineColor: "text.bold",
    outlineOffset: "2px",
  },
})

export const accentDot = css({
  display: "inline-block",
  w: "6px",
  h: "6px",
  rounded: "full",
  bg: "#2f855a",
  _dark: { bg: "#48bb78" },
  flexShrink: "0",
})

export const shortDate = (date: Date) =>
  date
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    })
    .toUpperCase()

const avatarStyles = css({
  rounded: "full",
  borderWidth: "1px",
  borderColor: "border",
  bg: "bg.muted",
  flexShrink: "0",
})

const avatarUrl = (author: Author, size: number) =>
  `https://github.com/${author.github}.png?size=${size * 2}`

interface AuthorLineProps {
  authors: Author[]
  readingTime?: number
  linked?: boolean
}

export function AuthorLine({ authors, readingTime, linked }: AuthorLineProps) {
  if (linked) {
    return (
      <HStack flexWrap="wrap" columnGap="8" rowGap="4">
        {authors.map((author) => (
          <HStack key={author.github} gap="3">
            <img
              src={avatarUrl(author, 32)}
              alt=""
              width={32}
              height={32}
              className={avatarStyles}
            />
            <Stack gap="1">
              <Box fontSize="14px" fontWeight="medium" color="text.bold">
                {author.name}
              </Box>
              <a
                href={`https://github.com/${author.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className={css({
                  fontFamily: "mono",
                  fontSize: "12px",
                  lineHeight: "1",
                  color: "text.muted",
                  _hover: { color: "text.bold" },
                })}
              >
                @{author.github}
              </a>
            </Stack>
          </HStack>
        ))}
      </HStack>
    )
  }

  return (
    <HStack gap="3" flexWrap="wrap">
      <HStack gap="2.5">
        <Box display="flex">
          {authors.map((author, index) => (
            <img
              key={author.github}
              src={avatarUrl(author, 22)}
              alt=""
              width={22}
              height={22}
              className={avatarStyles}
              style={{ marginInlineStart: index === 0 ? 0 : -6 }}
            />
          ))}
        </Box>
        <styled.span fontSize="13px" color="text.muted">
          {authors.map((author) => author.name).join(", ")}
        </styled.span>
      </HStack>
      {readingTime && (
        <styled.span className={eyebrow}>{readingTime} min</styled.span>
      )}
    </HStack>
  )
}
