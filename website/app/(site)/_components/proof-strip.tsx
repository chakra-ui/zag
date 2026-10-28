import { getCommunityStats } from "lib/community-stats"
import { formatCompact } from "lib/format-number"
import { Box, HStack, styled } from "styled-system/jsx"
import { gutter } from "./shared"

const usedBy = [
  { name: "Chakra UI", logo: "/logos/chakra.svg" },
  { name: "Ark UI", logo: "/logos/ark.svg" },
  { name: "Park UI", logo: "/logos/park.svg" },
  { name: "Skeleton", logo: "/logos/skeleton.png" },
  { name: "OVHcloud", logo: "/logos/ovh.svg" },
]

function Stat(props: { value: number; label: string }) {
  return (
    <Box>
      <styled.p
        fontSize="26px"
        fontWeight="semibold"
        letterSpacing="-0.03em"
        color="fg"
      >
        {formatCompact(props.value)}
      </styled.p>
      <styled.p fontFamily="mono" fontSize="11px" color="fg.subtle">
        {props.label}
      </styled.p>
    </Box>
  )
}

export async function ProofStrip() {
  const stats = await getCommunityStats()
  return (
    <Box bg="bg.raised" borderYWidth="1px" borderColor="border">
      <HStack
        maxW="1440px"
        mx="auto"
        justify="space-between"
        flexWrap="wrap"
        gap="8"
        px={gutter}
        py="7"
      >
        {stats && (
          <HStack gap="10" divideX="1px" divideColor="border.strong">
            <Stat value={stats.weeklyDownloads} label="weekly downloads" />
            <Box ps="10">
              <Stat value={stats.githubStars} label="GitHub stars" />
            </Box>
            <Box ps="10">
              <Stat value={stats.contributors} label="contributors" />
            </Box>
          </HStack>
        )}
        <HStack gap="7" flexWrap="wrap">
          <styled.p textStyle="eyebrow" color="fg.subtle">
            Used by
          </styled.p>
          {usedBy.map((item) => (
            <HStack key={item.name} gap="2">
              <styled.span
                display="grid"
                placeItems="center"
                boxSize="6"
                rounded="md"
                bg={{ _dark: "gray.50" }}
              >
                <styled.img src={item.logo} alt="" boxSize="4" />
              </styled.span>
              <styled.span
                fontSize="16px"
                fontWeight="semibold"
                letterSpacing="-0.02em"
                color="fg"
              >
                {item.name}
              </styled.span>
            </HStack>
          ))}
        </HStack>
      </HStack>
    </Box>
  )
}
