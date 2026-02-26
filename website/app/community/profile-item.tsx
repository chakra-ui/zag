import type { TeamMember } from "lib/community"
import { FaDiscord, FaGithub, FaXTwitter, FaYoutube } from "react-icons/fa6"
import { Box, HStack, Stack, styled } from "styled-system/jsx"

function getHandle(href: string) {
  try {
    const url = new URL(href)
    const handle = url.pathname.replace(/^\/+/, "").split("/")[0]
    return handle ? `@${handle}` : href
  } catch {
    return href
  }
}

function getAvatar(member: TeamMember) {
  if (member.avatar) return member.avatar
  const githubLink = member.links?.find((link) => link.label === "GitHub")
  if (githubLink) {
    const handle = getHandle(githubLink.href).replace(/^@/, "")
    if (handle) return `https://unavatar.io/github/${handle}`
  }
  const initials = encodeURIComponent(member.name)
  return `https://ui-avatars.com/api/?name=${initials}&background=f3f4f6&color=111827&size=128`
}

function PlatformIcon({ label }: { label: string }) {
  const normalized = label.toLowerCase()
  if (normalized.includes("github")) return <FaGithub />
  if (normalized.includes("x") || normalized.includes("twitter"))
    return <FaXTwitter />
  if (normalized.includes("youtube")) return <FaYoutube />
  if (normalized.includes("discord")) return <FaDiscord />
  return null
}

export function ProfileItem({ member }: { member: TeamMember }) {
  const links =
    member.links ??
    (member.href ? [{ label: "GitHub", href: member.href }] : [])

  return (
    <Stack
      gap="5"
      p={{ base: "5", md: "6" }}
      rounded="2xl"
      borderWidth="1px"
      borderColor="border.subtle"
      bg="bg"
      transition="all 0.2s"
      h="full"
      _hover={{
        borderColor: "border.emphasized",
        shadow: "sm",
        translateY: "-1px",
      }}
    >
      <HStack gap="4" alignItems="center">
        <styled.img
          src={getAvatar(member)}
          alt={member.name}
          boxSize="20"
          borderRadius="full"
          objectFit="cover"
        />
        <Stack gap="1">
          <styled.h3 fontSize="lg" fontWeight="semibold">
            {member.name}
          </styled.h3>
          <styled.p
            fontSize="xs"
            color="fg.muted"
            textTransform="uppercase"
            letterSpacing="0.12em"
            fontWeight="medium"
          >
            {member.role}
          </styled.p>
        </Stack>
      </HStack>
      <Box h="1px" bg="border.subtle" />
      {links.length > 0 ? (
        <Stack gap="2.5">
          {links.map((link) => (
            <styled.a
              key={`${member.name}-${link.label}`}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              display="inline-flex"
              alignItems="center"
              gap="2"
              fontSize="sm"
              color="fg.muted"
              w="fit-content"
              transition="all 0.2s"
              _hover={{ color: "fg" }}
              _focusVisible={{
                outline: "2px solid",
                outlineColor: "green.500",
                outlineOffset: "2px",
              }}
            >
              <styled.span
                fontSize="xs"
                color="fg.subtle"
                display="inline-flex"
              >
                <PlatformIcon label={link.label} />
              </styled.span>
              <styled.span fontFamily="mono" fontSize="xs" color="fg.subtle">
                {getHandle(link.href)}
              </styled.span>
            </styled.a>
          ))}
        </Stack>
      ) : null}
    </Stack>
  )
}
