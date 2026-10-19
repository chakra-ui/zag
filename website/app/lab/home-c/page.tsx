"use client"

import { Footer } from "components/footer"
import { pillarArt } from "components/lab/art"
import { HeroLive } from "components/lab/hero-live"
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

const hood = pillars.map((pillar, i) => ({ art: pillarArt[i], pillar }))

export default function HomeC() {
  return (
    <Box>
      <TopNav />
      <Frame>
        <Grid columns={{ base: 1, lg: 2 }} gap="0">
          <Pad display="flex" flexDirection="column" justifyContent="center">
            <Stack gap="6">
              <Eyebrow>Zag v2 · state machines for UI</Eyebrow>
              <Display>Poke it. It&rsquo;s a state machine.</Display>
              <Lead>
                Everything on that desk is a real Zag component. Flip the
                switch, drag the slider, pick a star. The tags show the state
                each machine is in, and the attributes it puts on your markup.
                You write the styles.
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
              <HeroLive />
            </Box>
          </Box>
        </Grid>

        <Band>
          <UsedBy />
        </Band>

        <Band>
          <Pad pb="10">
            <Eyebrow mb="3">Under the hood</Eyebrow>
            <Title maxW="24ch">What every machine on the desk gives you</Title>
          </Pad>
          <Grid className={cells} gap="1px" columns={{ base: 1, md: 2, xl: 4 }}>
            {hood.map(({ art: Art, pillar }) => (
              <Box key={pillar.label} display="flex" flexDirection="column">
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bg="bg.muted"
                  borderBottomWidth="1px"
                  borderColor="border"
                  px={{ base: "6", md: "10" }}
                  py="6"
                >
                  <Box w="full" maxW="320px">
                    <Art />
                  </Box>
                </Box>
                <Box p={{ base: "6", md: "8" }}>
                  <Eyebrow mb="2">{pillar.label.split(" / ")[1]}</Eyebrow>
                  <styled.h3
                    fontSize="17px"
                    fontWeight="semibold"
                    color="text.bold"
                  >
                    {pillar.title}
                  </styled.h3>
                  <styled.p
                    mt="2"
                    color="text.muted"
                    fontSize="15px"
                    lineHeight="1.6"
                  >
                    {pillar.body}
                  </styled.p>
                </Box>
              </Box>
            ))}
          </Grid>
        </Band>

        <Band>
          <Pad pb="10">
            <Eyebrow mb="3">How it works</Eyebrow>
            <Title>Three steps, any framework</Title>
          </Pad>
          <Steps />
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
