"use client"

import { Box, Grid, Stack, styled } from "styled-system/jsx"
import { Ctas, FrameworkRow, Install } from "./actions"
import { hCopy } from "lib/home"
import { GuideLogo } from "components/illustrations"
import { ReleaseBadge } from "./release-badge"
import { gutter } from "./shared"

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
      <Stack gap="7" minW="0">
        <ReleaseBadge />
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
