import { chapters } from "lib/home"
import { Box } from "styled-system/jsx"
import { ChapterSection } from "./_components/chapter.section"
import { ClosingSection } from "./_components/closing.section"
import { HeroSection } from "./_components/hero.section"
import { ProofStrip } from "./_components/proof-strip"
import { TourSection } from "./_components/tour.section"

export default function Page() {
  return (
    <Box maxW="1440px" mx="auto">
      <HeroSection />
      <ProofStrip />
      <TourSection />
      {chapters.map((c) => (
        <ChapterSection key={c.slug} chapter={c} />
      ))}
      <ClosingSection />
    </Box>
  )
}
