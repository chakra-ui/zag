import { cx } from "styled-system/css"
import { wrap } from "./home.css"
import {
  maker,
  makerList,
  makerLogo,
  makerTile,
  makers,
  makersLabel,
  proof,
  statLabel,
  statValue,
  stats,
} from "./proof.css"

const statItems = [
  { value: "6M", label: "monthly downloads" },
  { value: "50M+", label: "downloads in the past year" },
  { value: "5.2K", label: "GitHub stars" },
  { value: "148", label: "contributors" },
] as const

const makerItems = [
  { name: "OVHcloud", logo: "ovh" },
  { name: "AdGuard", logo: "adguardteam" },
  { name: "leboncoin", logo: "leboncoin" },
  { name: "DFINITY", logo: "dfinity" },
  { name: "Tonkeeper", logo: "tonkeeper" },
  { name: "Evil Martians", logo: "evilmartians" },
  { name: "HASH", logo: "hashintel" },
  { name: "Skeleton", logo: "skeletonlabs" },
] as const

export function ProofSection() {
  return (
    <section className={cx(wrap, proof)} aria-label="Numbers">
      <div className={stats}>
        {statItems.map((item) => (
          <div key={item.label}>
            <p className={statValue}>{item.value}</p>
            <p className={statLabel}>{item.label}</p>
          </div>
        ))}
      </div>
      <div className={makers}>
        <p className={makersLabel}>Used by teams at</p>
        <ul className={makerList}>
          {makerItems.map((item) => (
            <li key={item.name} className={cx("group", maker)}>
              <span className={makerTile}>
                <img
                  src={`/logos/users/${item.logo}.png`}
                  className={makerLogo}
                  alt=""
                  width={22}
                  height={22}
                />
              </span>
              {item.name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
