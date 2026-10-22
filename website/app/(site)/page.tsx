import { Frame } from "components/ui/layout"
import { ChapterSection } from "./_components/chapter.section"
import { ClosingSection } from "./_components/closing.section"
import { chapters } from "lib/home"
import { HeroSection } from "./_components/hero.section"
import { TourSection } from "./_components/tour.section"

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
