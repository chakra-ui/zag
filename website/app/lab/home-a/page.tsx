"use client"

import { Footer } from "components/footer"
import { ArtAnatomy, pillarArt } from "components/lab/art"
import { HeroIsoKeys } from "components/lab/hero-iso-keys"
import {
  Band,
  Cell,
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
import { Box, Grid, Stack } from "styled-system/jsx"

export default function HomeA() {
  return (
    <Box>
      <TopNav />
      <Frame>
        <Grid columns={{ base: 1, lg: 2 }} gap="0">
          <Pad display="flex" flexDirection="column" justifyContent="center">
            <Stack gap="6">
              <Eyebrow>Zag v2 · state machines for UI</Eyebrow>
              <Display>Events in. Accessible props out.</Display>
              <Lead>
                Zag runs your component logic as a state machine. Send it
                events, get back ARIA, focus and data attributes for any
                framework. You bring the markup and styles.
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
            <Box w="full" maxW="600px">
              <HeroIsoKeys />
            </Box>
          </Box>
        </Grid>

        <Band>
          <UsedBy />
        </Band>

        <Band>
          <Pad pb="10">
            <Eyebrow mb="3">Why Zag</Eyebrow>
            <Title maxW="22ch">
              Logic that holds up when the UI gets complicated
            </Title>
          </Pad>
          <Grid className={cells} gap="1px" columns={{ base: 1, md: 2, xl: 4 }}>
            {pillars.map((p, i) => (
              <Cell
                key={p.label}
                label={p.label}
                title={p.title}
                visual={(() => {
                  const Art = pillarArt[i]
                  return (
                    <Box w="full" maxW="300px" p="4">
                      <Art />
                    </Box>
                  )
                })()}
              >
                {p.body}
              </Cell>
            ))}
          </Grid>
        </Band>

        <Band>
          <Grid columns={{ base: 1, lg: 2 }} gap="0" alignItems="center">
            <Pad>
              <Eyebrow mb="3">Anatomy</Eyebrow>
              <Title maxW="18ch">Every part gets a name you can style</Title>
              <Lead mt="4">
                Machines describe a component as parts. Each part gets its
                props, ARIA and data attributes, so styling is just selectors.
              </Lead>
            </Pad>
            <Box
              p={{ base: "6", md: "10" }}
              borderLeftWidth={{ base: "0", lg: "1px" }}
              borderTopWidth={{ base: "1px", lg: "0" }}
              borderColor="border"
              display="flex"
              justifyContent="center"
            >
              <Box w="full" maxW="440px">
                <ArtAnatomy />
              </Box>
            </Box>
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
