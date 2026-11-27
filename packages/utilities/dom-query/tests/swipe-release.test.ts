// @vitest-environment jsdom

import { describe, expect, test } from "vitest"
import { isDismissSwipe, isSwipeIgnored, releaseStrength, resistPast, settleSwipe } from "../src/swipe"

describe("isDismissSwipe", () => {
  const swipe = (displacement: number, velocity = 0, furthest = displacement) => ({ displacement, velocity, furthest })

  test("dismisses past the distance, or on a flick however short", () => {
    expect(isDismissSwipe(swipe(41))).toBe(true)
    expect(isDismissSwipe(swipe(40))).toBe(false)
    expect(isDismissSwipe(swipe(8, 0.6))).toBe(true)
    expect(isDismissSwipe(swipe(8, 0.4))).toBe(false)
  })

  test("doesn't dismiss a swipe that ended the other way", () => {
    expect(isDismissSwipe(swipe(-60, 1))).toBe(false)
  })

  test("cancels when pulled back from the furthest point, unless pulling back is allowed", () => {
    expect(isDismissSwipe(swipe(60, 0, 75))).toBe(false)
    expect(isDismissSwipe(swipe(60, 0, 65))).toBe(true)
    expect(isDismissSwipe({ ...swipe(60, 0, 75), pullBack: Infinity })).toBe(true)
  })
})

describe("settleSwipe", () => {
  // a drawer's snap offsets: fully open, half, and closed at 800
  const points = [0, 400]

  test("rests a slow release on the nearest point", () => {
    expect(settleSwipe({ position: 150, velocity: 0, points, current: 0, dismissAt: 800 })).toBe(0)
    expect(settleSwipe({ position: 300, velocity: 0, points, current: 0, dismissAt: 800 })).toBe(1)
  })

  test("projects a flick before picking", () => {
    expect(settleSwipe({ position: 100, velocity: 1, points, current: 0, dismissAt: 800 })).toBe(1)
    expect(settleSwipe({ position: 450, velocity: 1, points, current: 400, dismissAt: 800 })).toBeNull()
  })

  test("dismisses when nearer the dismiss position, or past it", () => {
    expect(settleSwipe({ position: 650, velocity: 0, points, current: 400, dismissAt: 800 })).toBeNull()
    expect(settleSwipe({ position: 820, velocity: -1, points, current: 400, dismissAt: 800 })).toBeNull()
  })

  test("never dismisses without a dismiss position", () => {
    expect(settleSwipe({ position: 5000, velocity: 3, points })).toBe(1)
  })

  test("ignores a release flicked against a clear drag", () => {
    expect(settleSwipe({ position: 340, velocity: -1, points, current: 0, dismissAt: 800 })).toBe(1)
  })

  test("moves one point at a time in sequential mode", () => {
    const steps = [0, 200, 400]
    const settle = (position: number, velocity: number) =>
      settleSwipe({ position, velocity, points: steps, current: 0, dismissAt: 800, sequential: true })
    expect(settle(30, 0)).toBe(1)
    expect(settle(10, 0)).toBe(0)
    expect(settle(10, 2)).toBe(1)
    expect(
      settleSwipe({ position: 420, velocity: 2, points: steps, current: 400, dismissAt: 800, sequential: true }),
    ).toBeNull()
  })
})

describe("resistPast", () => {
  test("follows inside the bounds and resists past them", () => {
    expect(resistPast(50, { min: 0, max: 100 })).toBe(50)
    expect(resistPast(-16, { min: 0 })).toBe(-4)
    expect(resistPast(109, { max: 100 })).toBe(103)
    expect(resistPast(-50, { min: 0 }, (overshoot) => overshoot / 10)).toBe(-5)
  })
})

describe("releaseStrength", () => {
  test("is shorter the sooner the release speed covers the distance", () => {
    expect(releaseStrength({ distance: 100, velocity: 0 })).toBe(1)
    expect(releaseStrength({ distance: 36, velocity: 1 })).toBeCloseTo(0.19)
    expect(releaseStrength({ distance: 1000, velocity: 1 })).toBe(1)
  })
})

describe("isSwipeIgnored", () => {
  const press = (target: EventTarget) => ({ target })

  test("ignores fields, range and file inputs, and marked elements", () => {
    const root = document.body.appendChild(document.createElement("div"))
    root.innerHTML = `
      <input type="range" id="range" />
      <textarea id="text"></textarea>
      <div data-swipe-ignore><span id="marked"></span></div>
      <div data-no-drag="x"><span id="x-only"></span></div>
      <button id="plain"></button>`

    const el = (id: string) => root.querySelector(`#${id}`)!
    expect(isSwipeIgnored(press(el("range")))).toBe(true)
    expect(isSwipeIgnored(press(el("text")))).toBe(true)
    expect(isSwipeIgnored(press(el("marked")))).toBe(true)
    expect(isSwipeIgnored(press(el("x-only")), "x")).toBe(true)
    expect(isSwipeIgnored(press(el("x-only")), "y")).toBe(false)
    expect(isSwipeIgnored(press(el("plain")))).toBe(false)
    root.remove()
  })
})
