"use client"

import { Eyebrow } from "components/ui/layout"
import Link from "next/link"
import { Box, Grid, HStack, Stack, styled } from "styled-system/jsx"
import { Ctas, FrameworkRow, Install } from "./actions"
import { hCopy } from "./content"
import { GuideLogo } from "components/illustrations"
import { accent, gutter } from "./shared"

function Release() {
  return (
    <Link href="/guides/migration">
      <styled.span
        display="inline-flex"
        gap="2"
        fontFamily="mono"
        fontSize="12px"
        color="text.muted"
        transition="color 160ms"
        _hover={{ color: "text.bold" }}
      >
        <styled.span color="text.bold">v2</styled.span>
        <span>pre-release · see what changed →</span>
      </styled.span>
    </Link>
  )
}

export function HeroSection() {
  return (
    <Grid
      gridTemplateColumns={{ base: "1fr", lg: "minmax(0, 1fr) minmax(0, 1fr)" }}
      gap={{ base: "12", lg: "10" }}
      alignItems="center"
      px={gutter}
      pt={{ base: "12", md: "20" }}
      pb={{ base: "12", md: "20" }}
    >
      <Stack gap="7">
        <Stack gap="4">
          <Release />
          <HStack gap="2.5">
            <Box w="7px" h="7px" borderRadius="full" bg={accent} />
            <Eyebrow>{hCopy.hero.kicker}</Eyebrow>
          </HStack>
        </Stack>
        <styled.h1
          fontSize={{ base: "40px", md: "56px", xl: "64px" }}
          lineHeight="1.02"
          letterSpacing="-0.04em"
          fontWeight="semibold"
          color="text.bold"
          textWrap="balance"
          maxW="14ch"
        >
          {hCopy.hero.title}
        </styled.h1>
        <styled.p
          fontSize={{ base: "17px", md: "19px" }}
          lineHeight="1.55"
          color="text.muted"
          maxW="46ch"
          textWrap="pretty"
        >
          {hCopy.hero.subtitle}
        </styled.p>
        <Ctas />
        <Box w="full" maxW="lg">
          <Install />
        </Box>
        <FrameworkRow />
      </Stack>
      <Box w="full" maxW="640px" justifySelf="center">
        <GuideLogo />
      </Box>
    </Grid>
  )
}
