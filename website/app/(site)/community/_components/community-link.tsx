import type { CommunityLink as CommunityLinkItem } from "lib/community"
import { FaDiscord, FaGithub, FaXTwitter, FaYoutube } from "react-icons/fa6"
import { HStack, Stack, styled } from "styled-system/jsx"

function getIcon(title: string) {
  const name = title.toLowerCase()
  if (name.includes("discord")) return <FaDiscord />
  if (name.includes("youtube")) return <FaYoutube />
  if (name.includes("twitter")) return <FaXTwitter />
  return <FaGithub />
}

export function CommunityLink(props: { link: CommunityLinkItem }) {
  const { link } = props
  return (
    <styled.a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      display="block"
      p="4"
      mx="-4"
      rounded="sm"
      transition="background 0.15s"
      _hover={{ bg: "bg.muted" }}
      _focusVisible={{
        outline: "2px solid",
        outlineColor: "green.500",
        outlineOffset: "2px",
      }}
    >
      <HStack gap="4" alignItems="flex-start">
        <styled.span
          mt="0.5"
          flexShrink="0"
          color="text.muted"
          _icon={{ boxSize: "5" }}
          aria-hidden
        >
          {getIcon(link.title)}
        </styled.span>
        <Stack gap="1">
          <styled.span fontWeight="semibold">{link.title}</styled.span>
          <styled.span fontSize="sm" color="text.muted">
            {link.description}
          </styled.span>
        </Stack>
      </HStack>
    </styled.a>
  )
}
