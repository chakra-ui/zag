import { createRect, getRectCorners } from "./rect"
import type { Point, RectInit } from "./types"

export function getElementPolygon(rectValue: RectInit, placement: string) {
  const rect = createRect(rectValue)
  const { top, right, left, bottom } = getRectCorners(rect)
  const [base] = placement.split("-")

  return {
    top: [left, top, right, bottom],
    right: [top, right, bottom, left],
    bottom: [top, left, bottom, right],
    left: [right, top, left, bottom],
  }[base]
}

export function isPointInPolygon(polygon: Point[], point: Point) {
  const { x, y } = point
  let c = false

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x
    const yi = polygon[i].y
    const xj = polygon[j].x
    const yj = polygon[j].y

    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      c = !c
    }
  }
  return c
}

function createPolygonElement() {
  const id = "debug-polygon"
  const existingPolygon = document.getElementById(id)
  if (existingPolygon) {
    return existingPolygon
  }
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
  Object.assign(svg.style, {
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    opacity: "0.15",
    position: "fixed",
    pointerEvents: "none",
    fill: "red",
  })

  const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon")
  polygon.setAttribute("id", id)
  polygon.setAttribute("points", "0,0 0,0")
  svg.appendChild(polygon)
  document.body.appendChild(svg)
  return polygon
}

export function debugPolygon(polygon: Point[]) {
  const el = createPolygonElement()
  const points = polygon.map((point) => `${point.x},${point.y}`).join(" ")
  el.setAttribute("points", points)
  return () => {
    el.remove()
  }
}
