import { Box } from "styled-system/jsx"
import { A11ySection } from "./_components/a11y.section"
import { ClosingSection } from "./_components/closing.section"
import { EventsSection } from "./_components/events.section"
import { HeroSection } from "./_components/hero.section"
import { PartsSection } from "./_components/parts.section"
import { ProofStrip } from "./_components/proof-strip"
import { StatesSection } from "./_components/states.section"
import { TourSection } from "./_components/tour.section"

export default function Page() {
  return (
    <>
      <Box maxW="1440px" mx="auto">
        <HeroSection />
      </Box>
      <ProofStrip />
      <Box maxW="1440px" mx="auto">
        <TourSection />
        <StatesSection />
        <EventsSection />
        <PartsSection />
        <A11ySection />
        <ClosingSection />
      </Box>
    </>
  )
}
