import { arrow } from "./home.css"

export function Arrow() {
  return (
    <div className={arrow} aria-hidden="true">
      <svg width="22" height="12" viewBox="0 0 22 12">
        <path
          d="M1 6 H20 M15 1 L20 6 L15 11"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  )
}
