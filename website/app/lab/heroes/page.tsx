"use client"

import { Footer } from "components/footer"
import { HeroAnatomy } from "components/lab/hero-anatomy"
import { HeroFlow } from "components/lab/hero-flow"
import { HeroIsoKeys } from "components/lab/hero-iso-keys"
import { HeroStatefloor } from "components/lab/hero-statefloor"
import { cells, Eyebrow, Frame, Lead, Pad, Title } from "components/lab/kit"
import { TopNav } from "components/nav/top-nav"
import type { ComponentType } from "react"
import { Box, Grid, styled } from "styled-system/jsx"

const concepts: [string, string, ComponentType, string][] = [
  [
    "01",
    "statefloor",
    HeroStatefloor,
    "The statechart as a floor plan. A token steps closed → opening → open → closing along event arrows.",
  ],
  [
    "02",
    "keys",
    HeroIsoKeys,
    "Events in, props out. A key press travels through the machine and moves the highlight and aria-activedescendant.",
  ],
  [
    "03",
    "anatomy",
    HeroAnatomy,
    "A menu lifts apart into its anatomy parts while the highlight walks the items, then settles back.",
  ],
  [
    "04",
    "flow",
    HeroFlow,
    "HTML panels: event log, live machine and connect() props. The current non-iso option.",
  ],
]

export default function Heroes() {
  return (
    <Box>
      <TopNav />
      <Frame>
        <Pad>
          <Eyebrow mb="3">Lab · hero concepts</Eyebrow>
          <Title as="h1">Isometric heroes</Title>
          <Lead mt="4">
            Line art, one accent, one thing moving. Each one tells the Zag story
            in its own way.
          </Lead>
        </Pad>
        <Grid className={cells} gap="1px" columns={{ base: 1, lg: 2 }}>
          {concepts.map(([n, name, Hero, body]) => (
            <Box
              key={name}
              p={{ base: "4", md: "8" }}
              display="flex"
              flexDirection="column"
              gap="5"
            >
              <Box
                borderWidth="1px"
                borderColor="border"
                borderRadius="lg"
                minH={{ base: "320px", md: "460px" }}
                display="flex"
                alignItems="center"
                justifyContent="center"
                p={{ base: "4", md: "8" }}
              >
                <Box w="full" maxW="600px">
                  <Hero />
                </Box>
              </Box>
              <Box>
                <Eyebrow>
                  {n} · {name}
                </Eyebrow>
                <styled.p
                  mt="2"
                  color="text.muted"
                  fontSize="15px"
                  lineHeight="1.6"
                >
                  {body}
                </styled.p>
              </Box>
            </Box>
          ))}
        </Grid>
      </Frame>
      <Footer />
    </Box>
  )
}
