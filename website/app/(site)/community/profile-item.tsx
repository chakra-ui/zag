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
    <Stack gap="6" p={{ base: "6", md: "8" }} h="full">
      <HStack gap="4" alignItems="center">
        <styled.img
          src={getAvatar(member)}
          alt=""
          boxSize="14"
          flexShrink="0"
          borderRadius="full"
          objectFit="cover"
          borderWidth="1px"
          borderColor="border"
          bg="bg.muted"
        />
        <Box minW="0">
          <styled.h3
            fontSize="17px"
            fontWeight="semibold"
            letterSpacing="-0.01em"
            color="text.bold"
          >
            {member.name}
          </styled.h3>
          <styled.p
            mt="1"
            fontFamily="mono"
            fontSize="11px"
            letterSpacing="0.12em"
            textTransform="uppercase"
            color="text.muted"
          >
            {member.role}
          </styled.p>
        </Box>
      </HStack>
      {links.length > 0 ? (
        <HStack gap="4" flexWrap="wrap" mt="auto">
          {links.map((link) => (
            <styled.a
              key={`${member.name}-${link.label}`}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${member.name} on ${link.label}`}
              display="inline-flex"
              alignItems="center"
              gap="1.5"
              fontFamily="mono"
              fontSize="12px"
              color="text.muted"
              transition="color 120ms"
              _hover={{ color: "text.bold" }}
              focusVisibleRing="outside"
            >
              <styled.span display="inline-flex" fontSize="13px">
                <PlatformIcon label={link.label} />
              </styled.span>
              {getHandle(link.href)}
            </styled.a>
          ))}
        </HStack>
      ) : null}
    </Stack>
  )
}
