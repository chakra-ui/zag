"use client"

import { Box, Grid, styled } from "styled-system/jsx"
import { type HChapter, type HSection } from "./content"
import { guideArt } from "components/illustrations"
import { gutter, StateLabel } from "./shared"

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

export function ChapterSection(props: { chapter: HChapter }) {
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
