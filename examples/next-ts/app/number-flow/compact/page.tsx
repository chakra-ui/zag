"use client"

import { HeartIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { NumberFlow } from "@/components/number-flow"
import "@styles/number-flow.css"

const compact = { notation: "compact", maximumFractionDigits: 1 } as const

export default function Page() {
  const [views, setViews] = useState(12_480)
  const [likes, setLikes] = useState(1_249)
  const [liked, setLiked] = useState(false)

  // Views keep climbing; compact notation keeps the figure short
  useEffect(() => {
    const id = setInterval(() => setViews((v) => v + Math.round(Math.random() * 600)), 1200)
    return () => clearInterval(id)
  }, [])

  return (
    <main className="number-flow">
      <div className="nf-card">
        <span className="nf-card-title">Launch video</span>
        <div className="nf-stats">
          <div>
            <NumberFlow value={views} formatOptions={compact} />
            <span className="nf-caption">Views</span>
          </div>
          <div>
            <NumberFlow value={likes} formatOptions={compact} />
            <span className="nf-caption">Likes</span>
          </div>
        </div>
        <button
          className="nf-like"
          aria-pressed={liked}
          onClick={() => {
            setLiked(!liked)
            setLikes((l) => l + (liked ? -1 : 1))
          }}
        >
          <HeartIcon /> {liked ? "Liked" : "Like"}
        </button>
      </div>
    </main>
  )
}
