import { Footer } from "components/footer"
import { TopNav } from "components/nav/top-nav"
import { Section } from "components/ui/section"
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

export default function ShowcasePage() {
  return (
    <Box>
      <TopNav />

      <Section pt={{ base: "12", md: "20" }} pb={{ base: "16", md: "24" }}>
        <Box maxW="3xl" mb={{ base: "10", md: "14" }}>
          <styled.h1 textStyle="display.xl" mb="4">
            Built with Zag
          </styled.h1>
          <styled.p textStyle="text.lg" color="fg.muted">
            From startups to enterprise teams — Zag.js works everywhere
          </styled.p>
        </Box>

        <Grid
          gap={{ base: "6", lg: "8" }}
          columns={{ base: 1, sm: 2, lg: 3, xl: 4 }}
        >
          {showcaseItems.map((item) => (
            <ShowcaseCard key={item.href} item={item} />
          ))}
        </Grid>
      </Section>

      <Footer />
    </Box>
  )
}
