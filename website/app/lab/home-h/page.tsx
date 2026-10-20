"use client"

import { Footer } from "components/footer"
import { guideArt } from "components/lab/guide-art"
import { HLogo, HMini } from "components/lab/h-art"
import {
  chapters,
  hCopy,
  type HChapter,
  type HSection,
} from "components/lab/h-copy"
import {
  accent,
  ConnectPanel,
  StateRail,
  useActiveState,
} from "components/lab/h-parts"
import {
  cells,
  Ctas,
  Eyebrow,
  Frame,
  FrameworkRow,
  Install,
} from "components/lab/kit"
import { TopNav } from "components/nav/top-nav"
import { Box, Grid, HStack, Stack, styled } from "styled-system/jsx"

const gutter = { base: "4", sm: "6", md: "10" } as const

function StateLabel(props: { name: string; prefix?: string }) {
  return (
    <styled.p fontFamily="mono" fontSize="12px" color="text.muted">
      {props.prefix ?? "state"}:{" "}
      <styled.span color={accent}>&quot;{props.name}&quot;</styled.span>
    </styled.p>
  )
}

function Hero() {
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
        <HStack gap="2.5">
          <Box w="7px" h="7px" borderRadius="full" bg={accent} />
          <Eyebrow>{hCopy.hero.kicker}</Eyebrow>
        </HStack>
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
      <Box w="full" maxW="600px" justifySelf="center">
        <HLogo />
      </Box>
    </Grid>
  )
}

function Mini(props: { chapter: HChapter }) {
  const kind = props.chapter.sections[0]?.diagram ?? "principles"
  return (
    <Box
      w="full"
      maxW="148px"
      mx="auto"
      color="text.muted"
      transition="color 160ms"
      _groupHover={{ color: "text.bold" }}
    >
      <HMini kind={kind} />
    </Box>
  )
}

function Contents() {
  return (
    <Box>
      <HStack
        justify="space-between"
        gap="4"
        px={gutter}
        pb="5"
        flexWrap="wrap"
      >
        <Eyebrow>{hCopy.contents}</Eyebrow>
        <styled.p fontSize="14px" color="text.muted">
          {hCopy.hero.tour}
        </styled.p>
      </HStack>
      <Grid className={cells} gap="1px" columns={{ base: 2, md: 4, xl: 8 }}>
        {chapters.map((c) => (
          <styled.a
            key={c.slug}
            href={`#${c.slug}`}
            className="group"
            display="flex"
            flexDirection="column"
            gap="4"
            p="5"
            transition="background 160ms"
            _hover={{ bg: "bg.muted" }}
            focusVisibleRing="inside"
          >
            <Mini chapter={c} />
            <Box>
              <styled.p
                fontFamily="mono"
                fontSize="11px"
                color="text.muted"
                transition="color 160ms"
                _groupHover={{ color: accent }}
              >
                &quot;{c.state}&quot;
              </styled.p>
              <styled.p
                mt="1"
                fontSize="15px"
                fontWeight="medium"
                color="text.bold"
              >
                {c.label}
              </styled.p>
            </Box>
          </styled.a>
        ))}
        <styled.a
          href={hCopy.start.href}
          className="group"
          display="flex"
          flexDirection="column"
          justifyContent="flex-end"
          gap="1"
          p="5"
          transition="background 160ms"
          _hover={{ bg: "bg.muted" }}
          focusVisibleRing="inside"
        >
          <styled.p fontFamily="mono" fontSize="11px" color={accent}>
            &quot;{hCopy.start.state}&quot;
          </styled.p>
          <styled.p fontSize="15px" fontWeight="medium" color="text.bold">
            {hCopy.start.label} →
          </styled.p>
          <styled.p fontSize="13px" color="text.muted">
            {hCopy.start.body}
          </styled.p>
        </styled.a>
      </Grid>
    </Box>
  )
}

function Figure(props: { section: HSection }) {
  const Art = guideArt[props.section.diagram]
  return (
    <styled.figure
      borderWidth="1px"
      borderColor="border"
      borderRadius="lg"
      overflow="hidden"
    >
      {props.section.caption && (
        <styled.figcaption
          display="flex"
          alignItems="center"
          h="10"
          px="4"
          borderBottomWidth="1px"
          borderColor="border"
          fontFamily="mono"
          fontSize="12px"
          color="text.muted"
        >
          {props.section.caption}
        </styled.figcaption>
      )}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minH={{ base: "240px", md: "360px" }}
        p={{ base: "4", md: "10" }}
      >
        <Box w="full" maxW="560px">
          <Art />
        </Box>
      </Box>
    </styled.figure>
  )
}

function Section(props: { section: HSection }) {
  const { section } = props
  return (
    <Box pt={{ base: "14", md: "20" }}>
      <Box mb={{ base: "6", md: "8" }}>
        <styled.p fontFamily="mono" fontSize="12px" color="text.muted" mb="3">
          {section.id}
        </styled.p>
        <styled.h3
          fontSize={{ base: "22px", md: "26px" }}
          letterSpacing="-0.02em"
          fontWeight="semibold"
          color="text.bold"
        >
          {section.title}
        </styled.h3>
        <styled.p
          mt="2"
          fontSize={{ base: "16px", md: "17px" }}
          color="text.muted"
          maxW="60ch"
          textWrap="pretty"
        >
          {section.lead}
        </styled.p>
      </Box>
      <Grid
        gridTemplateColumns={{
          base: "minmax(0, 1fr)",
          lg: "minmax(0, 58fr) minmax(0, 42fr)",
        }}
        gap={{ base: "6", lg: "8" }}
        alignItems="start"
      >
        <Figure section={section} />
        <ConnectPanel
          title={hCopy.glossary}
          id={section.id}
          terms={section.terms}
        />
      </Grid>
    </Box>
  )
}

function Chapter(props: { chapter: HChapter }) {
  const { chapter } = props
  return (
    <styled.section
      id={chapter.slug}
      scrollMarginTop="80px"
      borderTopWidth="1px"
      borderColor="border"
      px={gutter}
      pt={{ base: "14", md: "20" }}
      pb={{ base: "16", md: "24" }}
    >
      <StateLabel name={chapter.state} />
      <styled.h2
        mt="3"
        fontSize={{ base: "32px", md: "44px" }}
        lineHeight="1.1"
        letterSpacing="-0.035em"
        fontWeight="semibold"
        color="text.bold"
      >
        {chapter.title}
      </styled.h2>
      <styled.p
        mt="5"
        fontSize={{ base: "17px", md: "20px" }}
        lineHeight="1.55"
        color="text.muted"
        maxW="58ch"
        textWrap="pretty"
      >
        {chapter.intro}
      </styled.p>
      {chapter.sections.map((s) => (
        <Section key={s.id} section={s} />
      ))}
    </styled.section>
  )
}

function Closing() {
  return (
    <Box
      borderTopWidth="1px"
      borderColor="border"
      px={gutter}
      py={{ base: "16", md: "28" }}
    >
      <StateLabel name={hCopy.closing.state} />
      <styled.h2
        mt="3"
        fontSize={{ base: "32px", md: "44px" }}
        lineHeight="1.1"
        letterSpacing="-0.035em"
        fontWeight="semibold"
        color="text.bold"
        maxW="22ch"
        textWrap="balance"
      >
        {hCopy.closing.title}
      </styled.h2>
      <styled.p
        mt="4"
        fontSize={{ base: "17px", md: "20px" }}
        lineHeight="1.55"
        color="text.muted"
        maxW="52ch"
        textWrap="pretty"
      >
        {hCopy.closing.body}
      </styled.p>
      <Box mt="8">
        <Ctas />
      </Box>
    </Box>
  )
}

export default function HomeH() {
  const active = useActiveState(chapters.map((c) => c.slug))
  return (
    <Box>
      <TopNav />
      <Frame>
        <Grid
          gridTemplateColumns={{
            base: "minmax(0, 1fr)",
            lg: "168px minmax(0, 1fr)",
          }}
          gap="0"
        >
          <Box
            hideBelow="lg"
            borderRightWidth="1px"
            borderColor="border"
            pt="10"
          >
            <StateRail items={chapters} active={active} />
          </Box>
          <Box minW="0">
            <Hero />
            <Contents />
            {chapters.map((c) => (
              <Chapter key={c.slug} chapter={c} />
            ))}
            <Closing />
          </Box>
        </Grid>
      </Frame>
      <Footer />
    </Box>
  )
}
