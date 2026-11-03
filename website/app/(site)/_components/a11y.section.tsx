import { IsoA11y } from "components/illustrations/a11y"
import { TwoToneHeading } from "components/ui/heading"
import { chapterCopy } from "lib/home"
import { Box, Grid, styled } from "styled-system/jsx"
import { featurePanel } from "styled-system/recipes"
import { gutter, StateLabel } from "./shared"

export function A11ySection() {
  const copy = chapterCopy.a11y
  const panel = featurePanel()
  return (
    <Box id="a11y" scrollMarginTop="80px" mx={gutter} py="24">
      <Grid
        gridTemplateColumns={{ base: "1fr", lg: "640px minmax(0, 1fr)" }}
        gap={{ base: "6", lg: "20" }}
        alignItems="end"
        mb="10"
      >
        <TwoToneHeading
          eyebrow={<StateLabel index="04" name="a11y" />}
          title={copy.title}
          accent={copy.accent}
          size="sectionFeatured"
        />
        <styled.p fontSize="16px" lineHeight="1.75" color="fg.muted">
          {copy.lead}
        </styled.p>
      </Grid>
      <div className={panel.root}>
        <div className={panel.art}>
          <IsoA11y />
        </div>
        <div className={panel.side}>
          {copy.cards.map((card) => (
            <div key={card.title} className={panel.cell}>
              <p className={panel.cellTitle}>{card.title}</p>
              <p className={panel.cellBody}>{card.body}</p>
            </div>
          ))}
        </div>
      </div>
    </Box>
  )
}
