import { Frame } from "components/ui/layout"
import { ChapterSection } from "./_home/chapter.section"
import { ClosingSection } from "./_home/closing.section"
import { chapters } from "./_home/content"
import { HeroSection } from "./_home/hero.section"
import { TourSection } from "./_home/tour.section"

export default function Page() {
  return (
    <Frame>
      <HeroSection />
      <TourSection />
      {chapters.map((c) => (
        <ChapterSection key={c.slug} chapter={c} />
      ))}
      <ClosingSection />
    </Frame>
  )
}
