import { DeepSection, FeaturesSection } from "./_home/features"
import { FrameworksSection } from "./_home/frameworks-section"
import { HeroSection } from "./_home/hero-section"
import { root } from "./_home/home.css"
import { LoopObserver } from "./_home/loop-observer"
import { ProofSection } from "./_home/proof-section"
import { StartSection } from "./_home/start-section"
import { StylingSection } from "./_home/styling-section"

export default function Page() {
  return (
    <div className={root}>
      <LoopObserver />
      <main id="top">
        <HeroSection />
        <ProofSection />
        <FrameworksSection />
        <FeaturesSection />
        <StylingSection />
        <DeepSection />
        <StartSection />
      </main>
    </div>
  )
}
