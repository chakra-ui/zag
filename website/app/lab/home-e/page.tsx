"use client"

import { Footer } from "components/footer"
import { pillarArt } from "components/lab/art"
import { HeroCatalog } from "components/lab/hero-catalog"
import {
  Band,
  Closing,
  Ctas,
  Display,
  Eyebrow,
  Frame,
  Install,
  Lead,
  Pad,
  pillars,
  Stats,
  Title,
  UsedBy,
} from "components/lab/kit"
import { TopNav } from "components/nav/top-nav"
import { Box, Grid, HStack, Stack, styled } from "styled-system/jsx"

export default function HomeE() {
  return (
    <Box>
      <TopNav />
      <Frame>
        <Pad
          textAlign="center"
          pt={{ base: "14", md: "20" }}
          pb={{ base: "10", md: "14" }}
        >
          <Stack gap="6" align="center">
            <Eyebrow>Zag v2 · the component catalog</Eyebrow>
            <Display maxW="16ch">
              50+ components. One way to build them.
            </Display>
            <Lead>
              Every widget below is a real Zag machine running in your browser.
              Click, type, tab through. Then style it however you like.
            </Lead>
            <HStack justify="center">
              <Ctas />
            </HStack>
            <Box w="full" maxW="lg" pt="2" textAlign="start">
              <Install />
            </Box>
          </Stack>
        </Pad>

        <HeroCatalog />

        <Band>
          <UsedBy />
        </Band>

        <Band>
          <Grid columns={{ base: 1, lg: 12 }} gap="0">
            <Box
              gridColumn={{ base: "auto", lg: "span 5" }}
              borderRightWidth={{ base: "0", lg: "1px" }}
              borderBottomWidth={{ base: "1px", lg: "0" }}
              borderColor="border"
            >
              <Pad position={{ base: "static", lg: "sticky" }} top="16">
                <Eyebrow mb="3">Why Zag</Eyebrow>
                <Title maxW="16ch">
                  Same machine underneath every one of them
                </Title>
                <Lead mt="4">
                  The date picker and the switch above share one model: a state
                  machine that takes events and hands back props.
                </Lead>
              </Pad>
            </Box>
            <Box gridColumn={{ base: "auto", lg: "span 7" }}>
              {pillars.map((p, i) => {
                const Art = pillarArt[i]
                return (
                  <Grid
                    key={p.label}
                    gridTemplateColumns={{ base: "1fr", md: "1fr 260px" }}
                    gap={{ base: "5", md: "8" }}
                    alignItems="center"
                    px={{ base: "6", md: "10" }}
                    py={{ base: "8", md: "10" }}
                    borderTopWidth={i === 0 ? "0" : "1px"}
                    borderColor="border"
                  >
                    <Box>
                      <Eyebrow>{p.label}</Eyebrow>
                      <styled.h3
                        mt="3"
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
                        maxW="44ch"
                      >
                        {p.body}
                      </styled.p>
                    </Box>
                    <Box
                      borderWidth="1px"
                      borderColor="border"
                      borderRadius="lg"
                      bg="bg.muted"
                      px="2"
                      py="1"
                    >
                      <Art />
                    </Box>
                  </Grid>
                )
              })}
            </Box>
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
