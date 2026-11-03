import { Chip } from "components/ui/chip"
import { CodePanel } from "components/ui/code-panel"
import { TwoToneHeading } from "components/ui/heading"
import { deepCopy } from "lib/home"
import Link from "next/link"
import { Box, Grid, HStack, Stack, styled } from "styled-system/jsx"
import { gutter, StateLabel } from "./shared"

const StyledLink = styled(Link)

export function DeepSection() {
  return (
    <styled.section
      id="deep"
      bg={{ base: "bg.raised", _dark: "bg.page" }}
      borderTopWidth="1px"
      borderColor="border.subtle"
    >
      <Stack
        maxW="1440px"
        mx="auto"
        px={gutter}
        py={{ base: "16", md: "104px" }}
        gap={{ base: "10", md: "12" }}
      >
        <Box maxW="820px">
          <TwoToneHeading
            eyebrow={<StateLabel index="06" name="custom" />}
            title={deepCopy.title}
            accent={deepCopy.accent}
            lead={deepCopy.lead}
            size="sectionFeatured"
          />
        </Box>
        <Grid columns={{ base: 1, lg: 2 }} gap="6">
          {deepCopy.levels.map((level) => (
            <Stack
              key={level.level}
              gap="5"
              p={{ base: "5", md: "7" }}
              bg={{ base: "white", _dark: "bg.raised" }}
              borderWidth="1px"
              borderColor="border"
              rounded="18px"
              minW="0"
            >
              <Stack gap="2">
                <HStack gap="2">
                  <Chip tone="accent">level {level.level}</Chip>
                  <styled.span
                    fontFamily="mono"
                    fontSize="11px"
                    color="fg.subtle"
                  >
                    {level.tag}
                  </styled.span>
                </HStack>
                <styled.h3
                  fontSize="21px"
                  fontWeight="semibold"
                  letterSpacing="-0.02em"
                  color="fg"
                >
                  {level.title}
                </styled.h3>
                <styled.p fontSize="15px" lineHeight="1.6" color="fg.muted">
                  {level.body}
                </styled.p>
              </Stack>
              <Box
                bg={{ base: "bg.raised", _dark: "bg.inset" }}
                borderWidth="1px"
                borderColor="border.subtle"
                rounded="10px"
                overflow="hidden"
                flex="1"
              >
                <CodePanel
                  code={level.code}
                  language={level.language}
                  highlight={[...level.highlight]}
                />
              </Box>
            </Stack>
          ))}
        </Grid>
        <HStack gap="2" flexWrap="wrap">
          <StyledLink
            href={deepCopy.more.href}
            fontSize="15px"
            fontWeight="medium"
            color="accent"
            _hover={{ textDecoration: "underline" }}
          >
            {deepCopy.more.label}
          </StyledLink>
          <styled.span fontSize="15px" color="fg.subtle">
            {deepCopy.more.body}
          </styled.span>
        </HStack>
      </Stack>
    </styled.section>
  )
}
