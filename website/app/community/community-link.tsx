import type { CommunityLink as CommunityLinkItem } from "lib/community"
import { FaDiscord, FaGithub, FaXTwitter, FaYoutube } from "react-icons/fa6"
import { Center, styled } from "styled-system/jsx"

interface CommunityLinkProps {
  link: CommunityLinkItem
}

function getCommunityLinkMeta(title: string) {
  const normalized = title.toLowerCase()
  if (normalized.includes("discord"))
    return { icon: <FaDiscord />, label: "Discord" }
  if (normalized.includes("github"))
    return { icon: <FaGithub />, label: "Github" }
  if (normalized.includes("x") || normalized.includes("twitter"))
    return { icon: <FaXTwitter />, label: "Twitter" }
  if (normalized.includes("youtube"))
    return { icon: <FaYoutube />, label: "YouTube" }
  return { icon: <FaGithub />, label: title }
}

export function CommunityLink(props: CommunityLinkProps) {
  const { link } = props
  const meta = getCommunityLinkMeta(link.title)

  return (
    <styled.a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      px={{ base: "4", md: "5" }}
      py={{ base: "4", md: "5" }}
      rounded="xl"
      borderWidth="1px"
      borderColor="border.subtle"
      bg="bg"
      display="grid"
      placeItems="center"
      textAlign="center"
      minH={{ base: "24", md: "28" }}
      gap="3"
      transition="all 0.2s"
      _hover={{
        borderColor: "border.emphasized",
        bg: "bg.subtle",
        shadow: "sm",
      }}
      _focusVisible={{
        outline: "2px solid",
        outlineColor: "green.500",
        outlineOffset: "2px",
      }}
    >
      <Center _icon={{ color: "text.primary.bold", boxSize: "8" }}>
        {meta.icon}
      </Center>
      <styled.span
        textStyle="xs"
        fontWeight="medium"
        fontFamily="mono"
        textTransform="uppercase"
        letterSpacing="wider"
      >
        {meta.label}
      </styled.span>
    </styled.a>
  )
}
