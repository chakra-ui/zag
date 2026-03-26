import type { Recording } from "lib/community"
import Image from "next/image"
import { FaYoutube } from "react-icons/fa6"
import { css } from "styled-system/css"
import { Box, HStack, Stack, styled } from "styled-system/jsx"

interface RecordingItemProps {
  video: Recording
}

function getYoutubeId(href: string) {
  try {
    const url = new URL(href)
    if (url.hostname.includes("youtu.be")) {
      return url.pathname.replace("/", "")
    }
    return url.searchParams.get("v")
  } catch {
    return null
  }
}

export function RecordingItem(props: RecordingItemProps) {
  const { video } = props
  const youtubeId = getYoutubeId(video.href)
  const thumbnail =
    video.image ??
    (youtubeId
      ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`
      : undefined)

  return (
    <styled.a
      href={video.href}
      target="_blank"
      rel="noopener noreferrer"
      display="block"
      rounded="xl"
      borderWidth="1px"
      borderColor="border.subtle"
      bg="bg"
      transition="border-color 0.2s, box-shadow 0.2s"
      overflow="hidden"
      _hover={{ borderColor: "border.emphasized", shadow: "sm" }}
      _focusVisible={{
        outline: "2px solid",
        outlineColor: "green.500",
        outlineOffset: "2px",
      }}
    >
      <HStack alignItems="stretch" gap="0">
        <Box
          position="relative"
          flexShrink={0}
          w={{ base: "36", md: "44" }}
          aspectRatio="16/9"
          overflow="hidden"
          className={css({
            background:
              "linear-gradient(135deg, token(colors.green.200/30), token(colors.blue.200/30))",
          })}
        >
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={video.title}
              fill
              sizes="(max-width: 768px) 40vw, 20vw"
              style={{ objectFit: "cover" }}
            />
          ) : null}
          {video.duration ? (
            <styled.span
              position="absolute"
              right="1.5"
              bottom="1.5"
              px="2"
              py="1"
              rounded="sm"
              bg="black/80"
              color="white"
              textStyle="xs"
              fontWeight="semibold"
              fontFamily="mono"
              lineHeight="1"
            >
              {video.duration}
            </styled.span>
          ) : null}
        </Box>

        <Stack
          gap="1.5"
          py="3"
          px="4"
          justifyContent="center"
          minW="0"
          flex="1"
        >
          <styled.h3 fontWeight="semibold" lineHeight="1.3" lineClamp="1">
            {video.title}
          </styled.h3>
          <styled.p textStyle="xs" color="fg.muted" lineClamp="1">
            {video.description}
          </styled.p>
        </Stack>

        <Box ps="3" pe="6" display="grid" placeItems="center" flexShrink={0}>
          <styled.span _icon={{ color: "text.primary.bold", boxSize: "5" }}>
            <FaYoutube />
          </styled.span>
        </Box>
      </HStack>
    </styled.a>
  )
}
