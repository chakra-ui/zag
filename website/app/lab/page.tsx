import { Footer } from "components/footer"
import { cells, Eyebrow, Frame, Lead, Pad, Title } from "components/lab/kit"
import { TopNav } from "components/nav/top-nav"
import Link from "next/link"
import { Box, Grid, styled } from "styled-system/jsx"

const variants = [
  [
    "a",
    "Keys",
    "Isometric keycaps send events into the machine; ARIA comes back out.",
  ],
  [
    "b",
    "Statefloor",
    "The statechart as an isometric floor, a token stepping between states.",
  ],
  [
    "c",
    "Desk",
    "Real components on a spec-sheet desk, played by a ghost cursor.",
  ],
  [
    "d",
    "Code-first",
    "Same component in four frameworks, with the live result floating over it.",
  ],
  ["e", "Catalog", "A bento wall of real, working components."],
  ["f", "Anatomy", "An isometric menu lifts apart into its anatomy parts."],
  [
    "g",
    "Field guide",
    "A Polar-style guide: chapters, diagrams and a glossary of how Zag thinks.",
  ],
]

export default function LabIndex() {
  return (
    <Box>
      <TopNav />
      <Frame>
        <Pad>
          <Eyebrow mb="3">Lab · homepage v2</Eyebrow>
          <Title as="h1">Seven directions</Title>
          <Lead mt="4">Same tone, same kit, different hero and story.</Lead>
        </Pad>
        <Grid className={cells} gap="1px" columns={{ base: 1, md: 2, xl: 3 }}>
          {variants.map(([id, name, body]) => (
            <Link key={id} href={`/lab/home-${id}`}>
              <Box p="8" _hover={{ bg: "bg.muted" }} h="full">
                <Eyebrow>Variant {id.toUpperCase()}</Eyebrow>
                <styled.h2
                  mt="3"
                  fontSize="20px"
                  fontWeight="semibold"
                  color="text.bold"
                >
                  {name} →
                </styled.h2>
                <styled.p mt="2" color="text.muted" fontSize="15px">
                  {body}
                </styled.p>
              </Box>
            </Link>
          ))}
        </Grid>
      </Frame>
      <Footer />
    </Box>
  )
}
