import type { Author } from "lib/source"
import { css } from "styled-system/css"
import { Box, HStack, Stack, styled } from "styled-system/jsx"

export const eyebrowStyles = css.raw({
  fontFamily: "mono",
  fontSize: "xs",
  fontWeight: "medium",
  lineHeight: "1",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "text.subtle",
})

export const eyebrow = css(eyebrowStyles)

const avatarStyles = css({
  rounded: "full",
  borderWidth: "2px",
  borderColor: "bg",
  bg: "bg.muted",
  flexShrink: "0",
})

const avatarUrl = (author: Author, size: number) =>
  `https://github.com/${author.github}.png?size=${size * 2}`

interface AuthorLineProps {
  authors: Author[]
  readingTime?: number
  /** a card per author linking to GitHub; off inside post cards, which are already links */
  linked?: boolean
}

export function AuthorLine({ authors, readingTime, linked }: AuthorLineProps) {
  if (linked) {
    return (
      <Stack gap="3">
        <Box fontSize="sm" color="text.subtle">
          Posted by
        </Box>
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
              <Stack gap="0">
                <Box fontSize="sm" fontWeight="medium">
                  {author.name}
                </Box>
                <a
                  href={`https://github.com/${author.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={css({
                    fontSize: "sm",
                    color: "text.muted",
                    _hover: { color: "text" },
                  })}
                >
                  @{author.github}
                </a>
              </Stack>
            </HStack>
          ))}
        </HStack>
      </Stack>
    )
  }

  return (
    <HStack gap="3" flexWrap="wrap" fontSize="sm">
      <HStack gap="2.5">
        <Box display="flex">
          {authors.map((author, index) => (
            <img
              key={author.github}
              src={avatarUrl(author, 24)}
              alt=""
              width={24}
              height={24}
              className={avatarStyles}
              style={{ marginInlineStart: index === 0 ? 0 : -8 }}
            />
          ))}
        </Box>
        <styled.span color="text.muted">
          {authors.map((author) => author.name).join(", ")}
        </styled.span>
      </HStack>
      {readingTime && (
        <>
          <styled.span aria-hidden color="text.subtle">
            ·
          </styled.span>
          <styled.span color="text.subtle">{readingTime} min read</styled.span>
        </>
      )}
    </HStack>
  )
}
