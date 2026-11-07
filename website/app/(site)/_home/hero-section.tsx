import Link from "next/link"
import siteConfig from "site.config"
import { cx } from "styled-system/css"
import { HeroMachine } from "./hero-machine"
import { button, buttonSolid, h1, wrap } from "./home.css"
import {
  buttonGhost,
  hero,
  heroActions,
  heroLede,
  heroMark,
  heroTitle,
} from "./hero.css"
import { InstallCommand } from "./install-command"

const markPath = "M243.68 67.7895L310.68 13.0287L265.18 112L369.68 7"

export function HeroSection() {
  return (
    <section className={cx(wrap, hero)}>
      <svg
        className={heroMark}
        width="112"
        height="96"
        viewBox="232 -4 146 126"
        aria-hidden="true"
      >
        <defs>
          <filter id="zh-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
        </defs>
        <path
          d={markPath}
          fill="none"
          strokeWidth="19"
          opacity=".45"
          filter="url(#zh-glow)"
        />
        <path d={markPath} fill="none" strokeWidth="19" />
      </svg>
      <h1 className={cx(h1, heroTitle)}>{siteConfig.hero.title}</h1>
      <p className={heroLede}>{siteConfig.hero.description}</p>
      <div className={heroActions}>
        <Link className={buttonSolid} href="/overview/introduction">
          Get started
        </Link>
        <Link className={cx(button, buttonGhost)} href="/overview/components">
          Browse components
        </Link>
      </div>
      <InstallCommand />
      <HeroMachine />
    </section>
  )
}
