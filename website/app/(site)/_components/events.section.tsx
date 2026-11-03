import { HeroIsoKeys } from "components/illustrations/keys"
import { TwoToneHeading } from "components/ui/heading"
import { chapterCopy } from "lib/home"
import { Box, Grid, styled } from "styled-system/jsx"
import { featurePanel, keycap } from "styled-system/recipes"
import { gutter, StateLabel } from "./shared"

export function EventsSection() {
  const copy = chapterCopy.events
  const panel = featurePanel()
  return (
    <Box
      id="events"
      scrollMarginTop="80px"
      mx={gutter}
      py="24"
      borderBottomWidth="1px"
      borderColor="border.subtle"
    >
      <Grid
        gridTemplateColumns={{ base: "1fr", lg: "640px minmax(0, 1fr)" }}
        gap={{ base: "6", lg: "20" }}
        alignItems="end"
        mb="10"
      >
        <TwoToneHeading
          eyebrow={<StateLabel index="02" name="events" />}
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
          <HeroIsoKeys />
        </div>
        <div className={panel.side}>
          {copy.rows.map((row) => (
            <div key={row.state + row.key} className={panel.cell}>
              <div className={panel.cellTitle}>
                <span
                  className={keycap({ kind: row.active ? "active" : "state" })}
                >
                  {row.state}
                </span>
                <span className={keycap()}>{row.key}</span>
              </div>
              <p className={panel.cellBody}>{row.result}</p>
            </div>
          ))}
        </div>
      </div>
    </Box>
  )
}
