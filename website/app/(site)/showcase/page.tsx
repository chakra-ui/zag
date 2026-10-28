import { ShowcaseCard } from "app/(site)/showcase/_components/showcase-card"
import { TwoToneHeading } from "components/ui/heading"
import { createPageMetadata } from "lib/seo"
import { showcaseItems } from "lib/showcase"
import { Box, Grid } from "styled-system/jsx"
import { button, pageHeader } from "styled-system/recipes"
import { gutter } from "../_components/shared"

export const metadata = createPageMetadata({
  title: "Showcase",
  description:
    "Discover projects and design systems built with Zag.js state machines",
  path: "/showcase",
})

const submitHref =
  "https://github.com/chakra-ui/zag/issues/new?title=Add%20to%20showcase%3A%20"

export default function ShowcasePage() {
  const header = pageHeader()
  const [lead, ...side] = showcaseItems.filter((item) => item.featured)
  const rest = showcaseItems.filter((item) => !item.featured)
  return (
    <Box maxW="1440px" mx="auto" px={gutter} pb="24">
      <header className={header.root}>
        <div className={header.copy}>
          <p className={header.eyebrow}>
            Showcase · {showcaseItems.length} projects
          </p>
          <TwoToneHeading
            as="h1"
            title="Built with Zag"
            accent="by teams who needed it to just work"
            size="display"
          />
          <p className={header.lead}>
            Design systems, component libraries and apps that run on Zag&apos;s
            machines.
          </p>
        </div>
        <a
          href={submitHref}
          target="_blank"
          rel="noopener noreferrer"
          className={button({ variant: "solid" })}
        >
          Submit a project →
        </a>
      </header>

      <Grid
        gridTemplateColumns={{
          base: "1fr",
          lg: "minmax(0, 2fr) minmax(0, 1fr)",
        }}
        gap="5"
      >
        <ShowcaseCard item={lead} size="lg" />
        <Grid gap="5" alignContent="space-between">
          {side.map((item) => (
            <ShowcaseCard key={item.href} item={item} size="md" />
          ))}
        </Grid>
      </Grid>

      <Grid columns={{ base: 1, sm: 2, lg: 3 }} gap="5" mt="5">
        {rest.map((item) => (
          <ShowcaseCard key={item.href} item={item} />
        ))}
      </Grid>
    </Box>
  )
}
