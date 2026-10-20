"use client"

import { Footer } from "components/footer"
import { GuideLogo, guideArt } from "components/lab/guide-art"
import { HLogo, HMini } from "components/lab/h-art"
import {
  chapters,
  hCopy,
  type HChapter,
  type HSection,
} from "components/lab/h-copy"
import { accent } from "components/lab/h-parts"
import {
  cells,
  Ctas,
  Eyebrow,
  Frame,
  FrameworkRow,
  Install,
} from "components/lab/kit"
import { TopNav } from "components/nav/top-nav"
import Link from "next/link"
import { Box, Grid, HStack, Stack, styled } from "styled-system/jsx"

const gutter = { base: "4", sm: "6", md: "10" } as const

function StateLabel(props: { name: string }) {
  return (
    <styled.p fontFamily="mono" fontSize="12px" color="text.muted">
      state: <styled.span color={accent}>&quot;{props.name}&quot;</styled.span>
    </styled.p>
  )
}

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

export type HeroArt = "iso" | "construction"

function Hero(props: { art: HeroArt }) {
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
      <Box
        w="full"
        maxW={props.art === "iso" ? "600px" : "640px"}
        justifySelf="center"
      >
        {props.art === "iso" ? <HLogo /> : <GuideLogo />}
      </Box>
    </Grid>
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
      <Grid
        className={cells}
        gap="1px"
        gridTemplateColumns={{
          base: "repeat(2, minmax(0, 1fr))",
          md: "repeat(4, minmax(0, 1fr))",
          xl: "repeat(8, minmax(0, 1fr))",
        }}
      >
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
            <Box
              w="full"
              maxW="148px"
              mx="auto"
              color="text.muted"
              transition="color 160ms"
              _groupHover={{ color: "text.bold" }}
            >
              <HMini kind={c.sections[0]?.diagram ?? "principles"} />
            </Box>
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

function Diagram(props: { section: HSection }) {
  const Art = guideArt[props.section.diagram]
  return (
    <Box>
      <Box
        borderWidth="1px"
        borderColor="border"
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
      {props.section.caption && (
        <styled.p
          mt="3"
          fontFamily="mono"
          fontSize="11px"
          letterSpacing="0.06em"
          color="text.muted"
        >
          {props.section.caption}
        </styled.p>
      )}
    </Box>
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
          fontWeight="medium"
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
          lg: "minmax(0, 62fr) minmax(0, 38fr)",
        }}
        gap={{ base: "8", lg: "12" }}
        alignItems="start"
      >
        <Diagram section={section} />
        <styled.dl
          display="flex"
          flexDirection="column"
          gap={{ base: "6", md: "8" }}
          pt={{ lg: "2" }}
        >
          {section.terms.map((t) => (
            <Box key={t.term}>
              <styled.dt fontSize="15px" fontWeight="medium" color="text.bold">
                {t.term}
              </styled.dt>
              <styled.dd
                mt="1.5"
                fontSize="15px"
                lineHeight="1.6"
                color="text.muted"
                textWrap="pretty"
              >
                {t.body}
              </styled.dd>
            </Box>
          ))}
        </styled.dl>
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
        fontWeight="medium"
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
        fontWeight="medium"
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

export function Home(props: { art?: HeroArt }) {
  return (
    <Box>
      <TopNav />
      <Frame>
        <Hero art={props.art ?? "iso"} />
        <Contents />
        {chapters.map((c) => (
          <Chapter key={c.slug} chapter={c} />
        ))}
        <Closing />
      </Frame>
      <Footer />
    </Box>
  )
}
