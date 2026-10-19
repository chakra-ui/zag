"use client"

import { Footer } from "components/footer"
import { pillarArt } from "components/lab/art"
import { HeroStatefloor } from "components/lab/hero-statefloor"
import {
  Band,
  cells,
  Closing,
  Ctas,
  Display,
  Eyebrow,
  Frame,
  FrameworkRow,
  Install,
  Lead,
  Pad,
  pillars,
  Stats,
  Steps,
  Title,
  UsedBy,
} from "components/lab/kit"
import { TopNav } from "components/nav/top-nav"
import { Box, Grid, Stack, styled } from "styled-system/jsx"

export default function HomeB() {
  return (
    <Box>
      <TopNav />
      <Frame>
        <Grid columns={{ base: 1, lg: 2 }} gap="0">
          <Pad display="flex" flexDirection="column" justifyContent="center">
            <Stack gap="6">
              <Eyebrow>Zag v2 · finite state machines</Eyebrow>
              <Display>UI components powered by finite state machines</Display>
              <Lead>
                Every open, close, focus and keypress is an explicit transition.
                Predictable behavior for 50+ components, in any framework.
              </Lead>
              <Ctas />
              <Box pt="6">
                <Install />
              </Box>
              <FrameworkRow />
            </Stack>
          </Pad>
          <Box
            borderLeftWidth={{ base: "0", lg: "1px" }}
            borderTopWidth={{ base: "1px", lg: "0" }}
            borderColor="border"
            display="flex"
            alignItems="center"
            justifyContent="center"
            p={{ base: "4", md: "10" }}
          >
            <Box w="full" maxW="560px">
              <HeroStatefloor />
            </Box>
          </Box>
        </Grid>

        <Band>
          <UsedBy />
        </Band>

        <Band>
          <Pad pb="10">
            <Eyebrow mb="3">Getting started</Eyebrow>
            <Title maxW="22ch">
              From install to interactive in three lines
            </Title>
          </Pad>
          <Steps />
        </Band>

        <Band>
          <Pad pb="10">
            <Eyebrow mb="3">Principles</Eyebrow>
            <Title maxW="22ch">
              The parts of a component you shouldn't rewrite
            </Title>
          </Pad>
          <Grid className={cells} gap="1px" columns={{ base: 1, lg: 2 }}>
            {pillars.map((p, i) => {
              const Art = pillarArt[i]
              return (
                <Grid
                  key={p.label}
                  columns={{ base: 1, sm: 2 }}
                  gap={{ base: "6", md: "8" }}
                  alignItems="center"
                  p={{ base: "6", md: "8" }}
                >
                  <Box>
                    <Eyebrow mb="2">{p.label}</Eyebrow>
                    <styled.h3
                      fontSize="17px"
                      fontWeight="semibold"
                      color="text.bold"
                    >
                      {p.title}
                    </styled.h3>
                    <styled.p
                      mt="2"
                      color="text.muted"
                      fontSize="15px"
                      lineHeight="1.6"
                    >
                      {p.body}
                    </styled.p>
                  </Box>
                  <Box
                    borderWidth="1px"
                    borderColor="border"
                    borderRadius="lg"
                    bg="bg.muted"
                    px="3"
                    py="2"
                  >
                    <Art />
                  </Box>
                </Grid>
              )
            })}
          </Grid>
        </Band>

        <Band>
          <Stats />
        </Band>

        <Closing />
      </Frame>
      <Footer />
    </Box>
  )
}
