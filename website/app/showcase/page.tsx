import { Footer } from "components/footer"
import { cells } from "components/lab/cells"
import { Band, Eyebrow, Frame, Lead, Pad, Title } from "components/lab/kit"
import { TopNav } from "components/nav/top-nav"
import { ShowcaseCard } from "components/showcase-card"
import { showcaseItems } from "lib/showcase"
import { createPageMetadata } from "lib/seo"
import { Box, Grid, styled } from "styled-system/jsx"

export const metadata = createPageMetadata({
  title: "Showcase",
  description:
    "Discover projects and design systems built with Zag.js state machines",
  path: "/showcase",
})

const addHref =
  "https://github.com/chakra-ui/zag/issues/new?title=Add%20to%20showcase%3A%20"

export default function ShowcasePage() {
  return (
    <Box>
      <TopNav />
      <Frame>
        <Pad>
          <Eyebrow mb="3">Showcase · {showcaseItems.length} projects</Eyebrow>
          <Title as="h1">Built with Zag</Title>
          <Lead mt="4">
            Design systems and products that run their component logic on Zag
            machines.
          </Lead>
        </Pad>
        <Grid
          className={cells}
          gap="1px"
          columns={{ base: 1, sm: 2, lg: 3, xl: 4 }}
        >
          {showcaseItems.map((item) => (
            <ShowcaseCard key={item.href} item={item} />
          ))}
          <styled.a
            href={addHref}
            target="_blank"
            rel="noopener noreferrer"
            display="flex"
            alignItems="center"
            justifyContent="center"
            minH="240px"
            p="6"
            color="text.muted"
            fontFamily="mono"
            fontSize="13px"
            _hover={{ color: "text.bold", bg: "bg.muted" }}
          >
            + Add your project
          </styled.a>
        </Grid>
        <Band />
      </Frame>
      <Footer />
    </Box>
  )
}
