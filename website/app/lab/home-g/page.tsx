"use client"

import { Footer } from "components/footer"
import { guideArt, GuideLogo } from "components/lab/guide-art"
import {
  guide,
  type DiagramKey,
  type GuideChapter,
  type GuideSection,
} from "components/lab/guide-copy"
import {
  accent,
  BracketLink,
  ChapterRail,
  CornerTicks,
  Glyph,
  useActiveChapter,
} from "components/lab/guide-parts"
import { Eyebrow, Frame, Install } from "components/lab/kit"
import { TopNav } from "components/nav/top-nav"
import { css } from "styled-system/css"
import { Box, Grid, HStack, Stack, styled } from "styled-system/jsx"

const getStarted = "/overview/introduction"
const browse = "/components/react/accordion"

function splitKicker(kicker: string) {
  const [head, ...rest] = kicker.split("·").map((s) => s.trim())
  const tail = rest.join(" · ")
  return {
    head,
    tail: tail ? tail.charAt(0).toUpperCase() + tail.slice(1) : "",
  }
}

function heroLines() {
  const { title, kicker } = guide.hero
  if (title.includes("\n")) return title.split("\n")
  return [title, splitKicker(kicker).tail || kicker]
}

function cardDiagram(slug: string): DiagramKey {
  const chapter = guide.chapters.find((c) => c.slug === slug)
  if (chapter?.sections[0]) return chapter.sections[0].diagram
  return slug in guideArt ? (slug as DiagramKey) : "principles"
}

const logoSlot = css({
  w: "full",
  "&:empty": { display: "none" },
  "&:empty + [data-fallback]": { display: "block" },
})

const gutter = { base: "4", sm: "6", md: "10" } as const

function GuideBar() {
  const { head, tail } = splitKicker(guide.hero.kicker)
  return (
    <Grid
      gridTemplateColumns="1fr auto 1fr"
      alignItems="center"
      px={gutter}
      h="12"
      borderBottomWidth="1px"
      borderColor="border"
      hideBelow="md"
    >
      <Eyebrow>Field guide · {guide.chapters.length} chapters</Eyebrow>
      <styled.p fontSize="14px" color="text.bold">
        {head}
        {tail && (
          <styled.span color="text.muted" ms="2">
            {tail}
          </styled.span>
        )}
      </styled.p>
      <Box justifySelf="end">
        <BracketLink href={getStarted}>{guide.hero.cta}</BracketLink>
      </Box>
    </Grid>
  )
}

function Hero() {
  const [first, second] = heroLines()
  const Fallback = guideArt.principles
  return (
    <Grid
      gridTemplateColumns={{ base: "1fr", lg: "1.05fr 1fr" }}
      gap={{ base: "12", lg: "8" }}
      alignItems="center"
      px={gutter}
      pt={{ base: "12", md: "20" }}
      pb={{ base: "12", md: "16" }}
    >
      <Stack gap="8">
        <styled.h1
          fontSize={{ base: "40px", md: "56px", xl: "64px" }}
          lineHeight="1.04"
          letterSpacing="-0.04em"
          fontWeight="medium"
          color="text.bold"
          textWrap="balance"
        >
          {first}
          {second && (
            <styled.span display="block" color="text.muted">
              {second}
            </styled.span>
          )}
        </styled.h1>
        <styled.p
          fontSize={{ base: "18px", md: "22px" }}
          lineHeight="1.45"
          color="text.muted"
          maxW="34ch"
          textWrap="pretty"
        >
          {guide.hero.subtitle}
        </styled.p>
        <HStack gap="6" flexWrap="wrap">
          <BracketLink href={getStarted}>{guide.hero.cta}</BracketLink>
          <BracketLink href={browse} muted>
            {guide.hero.secondary}
          </BracketLink>
        </HStack>
        <Box pt="2">
          <Install />
        </Box>
      </Stack>
      <Box position="relative" w="full" maxW="600px" justifySelf="center">
        <div className={logoSlot}>
          <GuideLogo />
        </div>
        <Box data-fallback="" display="none" pointerEvents="none">
          <Fallback />
        </Box>
      </Box>
    </Grid>
  )
}

function ChapterCards() {
  return (
    <Box px={gutter} pb={{ base: "16", md: "24" }}>
      <Eyebrow mb="5">Contents</Eyebrow>
      <Grid
        gridTemplateColumns={{
          base: "repeat(2, minmax(0, 1fr))",
          md: "repeat(4, minmax(0, 1fr))",
          xl: "repeat(7, minmax(0, 1fr))",
        }}
        gap={{ base: "3", md: "4" }}
      >
        {guide.cards.map((card) => (
          <styled.a
            key={card.slug}
            href={`#${card.slug}`}
            position="relative"
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            gap="4"
            minH={{ base: "128px", md: "176px" }}
            p="4"
            className="group"
            transition="background 160ms"
            _hover={{ bg: "bg.muted" }}
            focusVisibleRing="inside"
          >
            <CornerTicks
              className={css({ _groupHover: { borderColor: "text.muted" } })}
            />
            <styled.span
              fontFamily="mono"
              fontSize="11px"
              color="text.muted"
              _groupHover={{ color: accent }}
              transition="color 160ms"
            >
              {card.id}
            </styled.span>
            <Box
              alignSelf="center"
              _groupHover={{ "& svg": { color: "text.bold" } }}
            >
              <Glyph name={cardDiagram(card.slug)} />
            </Box>
            <styled.span fontSize="15px" color="text.bold">
              {card.label}
            </styled.span>
          </styled.a>
        ))}
      </Grid>
    </Box>
  )
}

function Diagram(props: { section: GuideSection }) {
  const Art = guideArt[props.section.diagram]
  return (
    <Box>
      <Box
        position="relative"
        borderWidth="1px"
        borderColor="border"
        display="flex"
        alignItems="center"
        justifyContent="center"
        minH={{ base: "240px", md: "360px" }}
        p={{ base: "4", md: "10" }}
      >
        <CornerTicks />
        <Box w="full" maxW="560px">
          {Art ? <Art /> : null}
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

function Section(props: {
  section: GuideSection
  index: number
  chapter: GuideChapter
}) {
  const { section } = props
  return (
    <Box pt={{ base: "14", md: "20" }}>
      <Box mb={{ base: "6", md: "8" }}>
        <Eyebrow mb="3">
          {props.chapter.id}.{props.index + 1}
        </Eyebrow>
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
          base: "1fr",
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

function Chapter(props: { chapter: GuideChapter }) {
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
      <styled.h2
        fontSize={{ base: "32px", md: "44px" }}
        lineHeight="1.1"
        letterSpacing="-0.035em"
        fontWeight="medium"
        color="text.bold"
      >
        <styled.span
          color="text.muted"
          me={{ base: "3", md: "4" }}
          fontVariantNumeric="tabular-nums"
        >
          {chapter.id}
        </styled.span>
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
      {chapter.sections.map((s, i) => (
        <Section key={s.title} section={s} index={i} chapter={chapter} />
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
      <Box position="relative" p={{ base: "8", md: "14" }}>
        <CornerTicks />
        <Eyebrow mb="4">
          <styled.span color={accent}>&gt;</styled.span> End of guide
        </Eyebrow>
        <styled.h2
          fontSize={{ base: "32px", md: "44px" }}
          lineHeight="1.1"
          letterSpacing="-0.035em"
          fontWeight="medium"
          color="text.bold"
          maxW="22ch"
          textWrap="balance"
        >
          {guide.closing.title}
        </styled.h2>
        <styled.p
          mt="4"
          fontSize={{ base: "17px", md: "20px" }}
          lineHeight="1.55"
          color="text.muted"
          maxW="52ch"
          textWrap="pretty"
        >
          {guide.closing.body}
        </styled.p>
        <HStack gap="6" mt="8" flexWrap="wrap">
          <BracketLink href={getStarted}>{guide.closing.cta}</BracketLink>
          <BracketLink href={browse} muted>
            {guide.hero.secondary}
          </BracketLink>
        </HStack>
      </Box>
    </Box>
  )
}

export default function HomeG() {
  const active = useActiveChapter(guide.chapters.map((c) => c.slug))
  return (
    <Box>
      <TopNav />
      <Frame>
        <GuideBar />
        <Grid
          gridTemplateColumns={{
            base: "minmax(0, 1fr)",
            lg: "64px minmax(0, 1fr)",
          }}
          gap="0"
        >
          <Box
            hideBelow="lg"
            borderRightWidth="1px"
            borderColor="border"
            display="flex"
            justifyContent="center"
          >
            <ChapterRail items={guide.chapters} active={active} />
          </Box>
          <Box minW="0">
            <Hero />
            <ChapterCards />
            {guide.chapters.map((c) => (
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
