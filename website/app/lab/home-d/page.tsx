"use client"

import { Footer } from "components/footer"
import { pillarArt } from "components/lab/art"
import { adapters } from "components/lab/d-adapters"
import { InstallCards } from "components/lab/d-install"
import { Playground } from "components/lab/d-playground"
import { HeroCode } from "components/lab/hero-code"
import {
  Band,
  Cell,
  cells,
  Closing,
  Ctas,
  Display,
  Eyebrow,
  Frame,
  Lead,
  Pad,
  pillars,
  Stats,
  Title,
  UsedBy,
} from "components/lab/kit"
import { TopNav } from "components/nav/top-nav"
import { Box, Grid, HStack, Stack, styled } from "styled-system/jsx"

const returns = [
  {
    label: "props",
    title: "Typed props for every part",
    body: "Spread them on your own elements. Handlers, ids and refs come wired.",
    code: `api.getInputProps()
// {
//   id: "number-input:r1:input",
//   inputMode: "decimal",
//   value: "4",
//   onChange, onKeyDown,
//   onBlur, onFocus …
// }`,
  },
  {
    label: "aria",
    title: "ARIA that tracks state",
    body: "Roles and aria-* attributes update as the machine transitions.",
    code: `api.getInputProps()
// {
//   role: "spinbutton",
//   "aria-valuenow": 4,
//   "aria-valuemin": 0,
//   "aria-valuemax": 10,
//   "aria-roledescription": "numberfield"
// }`,
  },
  {
    label: "data-attrs",
    title: "Data attributes to style on",
    body: "Target parts and states from any CSS, no class juggling.",
    code: `api.getIncrementTriggerProps()
// {
//   "data-number-input-increment-trigger": "seats",
//   "data-disabled": "",
//   disabled: true
// }`,
  },
]

export default function HomeD() {
  return (
    <Box>
      <TopNav />
      <Frame>
        <Grid
          gridTemplateColumns={{
            base: "minmax(0, 1fr)",
            lg: "minmax(0, 5fr) minmax(0, 7fr)",
          }}
          gap="0"
          alignItems="center"
        >
          <Pad display="flex" flexDirection="column" justifyContent="center">
            <Stack gap="6">
              <Eyebrow>Zag v2 · one machine, every framework</Eyebrow>
              <Display fontSize={{ base: "40px", md: "52px", lg: "54px" }}>
                Write the logic once. <br />
                Ship it everywhere.
              </Display>
              <Lead>
                Zag machines hold the behaviour, keyboard handling and ARIA for
                50+ components. The adapter is three lines. The markup and the
                styles stay yours.
              </Lead>
              <Ctas />
            </Stack>
          </Pad>
          <Box
            px={{ base: "4", sm: "6", md: "10" }}
            py={{ base: "10", md: "16" }}
            borderTopWidth={{ base: "1px", lg: "0" }}
            borderColor="border"
          >
            <HeroCode />
          </Box>
        </Grid>

        <Band>
          <Grid
            className={cells}
            gap="1px"
            columns={{ base: 2, sm: 3, lg: 6 }}
            borderTopWidth="0"
          >
            <Box
              px={{ base: "4", sm: "6", md: "8" }}
              py="6"
              display="flex"
              alignItems="center"
            >
              <Eyebrow>Framework agnostic</Eyebrow>
            </Box>
            {adapters.map((a) => (
              <HStack
                key={a.id}
                gap="3"
                px={{ base: "4", sm: "6", md: "8" }}
                py="6"
                color="text.muted"
                transition="color 200ms"
                _hover={{
                  color: "text.bold",
                  "& [data-logo]": { filter: "none", opacity: 1 },
                }}
              >
                <Box
                  data-logo=""
                  w="5"
                  h="5"
                  filter="grayscale(1)"
                  opacity="0.75"
                  transition="filter 240ms, opacity 240ms"
                  css={{ "& svg": { w: "full", h: "full" } }}
                >
                  <a.icon />
                </Box>
                <styled.span fontSize="15px" fontWeight="medium">
                  {a.label}
                </styled.span>
              </HStack>
            ))}
          </Grid>
        </Band>

        <Band>
          <Grid
            className={cells}
            gap="1px"
            columns={{ base: 1, md: 2, xl: 4 }}
            borderTopWidth="0"
          >
            {pillars.map((p, i) => {
              const Art = pillarArt[i]
              return (
                <Cell
                  key={p.label}
                  label={p.label}
                  title={p.title}
                  visual={<Art />}
                >
                  {p.body}
                </Cell>
              )
            })}
          </Grid>
        </Band>

        <Band>
          <Grid
            gridTemplateColumns={{
              base: "minmax(0, 1fr)",
              lg: "minmax(0, 4fr) minmax(0, 8fr)",
            }}
            gap="0"
          >
            <Pad>
              <Eyebrow mb="3">service.send(event)</Eyebrow>
              <Title maxW="16ch">Watch the machine think</Title>
              <Lead mt="4" fontSize={{ base: "15px", md: "16px" }}>
                Every click and keypress becomes an event. The machine picks the
                transition, runs the effects and hands back fresh props. Nothing
                hides in a useEffect.
              </Lead>
              <Stack
                mt="8"
                gap="3"
                fontFamily="mono"
                fontSize="12px"
                color="text.muted"
              >
                {[
                  ["send", "an event goes in"],
                  ["state", "one transition, never two"],
                  ["props", "ARIA and data-* come out"],
                ].map(([k, v]) => (
                  <HStack key={k} gap="3">
                    <styled.span w="12" color="text.bold">
                      {k}
                    </styled.span>
                    <styled.span>{v}</styled.span>
                  </HStack>
                ))}
              </Stack>
            </Pad>
            <Box
              px={{ base: "4", sm: "6", md: "10" }}
              py={{ base: "0", lg: "20" }}
              pb={{ base: "12", lg: "20" }}
            >
              <Playground />
            </Box>
          </Grid>
        </Band>

        <Band>
          <Pad pb="10">
            <Eyebrow mb="3">connect(service, normalizeProps)</Eyebrow>
            <Title maxW="22ch">What the machine gives you</Title>
          </Pad>
          <Grid className={cells} gap="1px" columns={{ base: 1, md: 3 }}>
            {returns.map((r) => (
              <Box
                key={r.label}
                p={{ base: "6", md: "8" }}
                display="flex"
                flexDirection="column"
                gap="6"
              >
                <styled.pre
                  minH="172px"
                  p="4"
                  borderWidth="1px"
                  borderColor="border"
                  borderRadius="lg"
                  bg="bg.muted"
                  fontFamily="mono"
                  fontSize="12px"
                  lineHeight="1.7"
                  color="text.muted"
                  overflowX="auto"
                >
                  {r.code}
                </styled.pre>
                <Box>
                  <Eyebrow mb="2">{r.label}</Eyebrow>
                  <styled.h3
                    fontSize="17px"
                    fontWeight="semibold"
                    color="text.bold"
                  >
                    {r.title}
                  </styled.h3>
                  <styled.p
                    mt="2"
                    color="text.muted"
                    fontSize="15px"
                    lineHeight="1.6"
                  >
                    {r.body}
                  </styled.p>
                </Box>
              </Box>
            ))}
          </Grid>
        </Band>

        <Band>
          <Stats />
        </Band>

        <Band>
          <UsedBy />
        </Band>

        <Band>
          <Pad pb="10">
            <Eyebrow mb="3">pnpm add</Eyebrow>
            <Title maxW="22ch">Pick an adapter. Keep the machine.</Title>
          </Pad>
          <InstallCards />
        </Band>

        <Closing />
      </Frame>
      <Footer />
    </Box>
  )
}
